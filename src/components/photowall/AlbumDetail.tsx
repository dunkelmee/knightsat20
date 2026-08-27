import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, Plus } from 'lucide-react';
import { AlbumDetail as AlbumDetailType, Photo, UserProfile } from '../../types';
import { deletePhoto, fetchAlbum, uploadAlbumPhotos } from '../../api/client';
import { resizePhotoForUpload } from '../../utils/imageResize';
import { Lightbox } from './Lightbox';

interface AlbumDetailProps {
  albumId: string;
  currentUser: UserProfile;
  isAdmin: boolean;
  onBack: () => void;
}

export const AlbumDetail: React.FC<AlbumDetailProps> = ({ albumId, currentUser, isAdmin, onBack }) => {
  const [album, setAlbum] = useState<AlbumDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setAlbum(await fetchAlbum(albumId));
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, [albumId]);

  const handleLoadMore = async () => {
    if (!album?.nextCursor) return;
    const more = await fetchAlbum(albumId, album.nextCursor);
    setAlbum((prev) => (prev ? { ...more, photos: [...prev.photos, ...more.photos] } : more));
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    e.target.value = '';
    if (!fileList || fileList.length === 0) return;
    const files: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);
      if (file) files.push(file);
    }

    setUploadError('');
    setIsUploading(true);
    try {
      const pairs = await Promise.all(
        files.map(async (file) => {
          const { full, thumb } = await resizePhotoForUpload(file);
          return { full, thumb };
        })
      );
      const uploaded = await uploadAlbumPhotos(albumId, pairs);
      setAlbum((prev) =>
        prev ? { ...prev, photos: [...uploaded, ...prev.photos], photoCount: prev.photoCount + uploaded.length } : prev
      );
    } catch {
      setUploadError("Couldn't process one or more photos. Try a JPG or PNG instead.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    await deletePhoto(albumId, photo.id);
    setAlbum((prev) =>
      prev ? { ...prev, photos: prev.photos.filter((p) => p.id !== photo.id), photoCount: prev.photoCount - 1 } : prev
    );
    setLightboxPhoto(null);
  };

  if (isLoading || !album) {
    return <div className="max-w-5xl mx-auto py-10 px-4 text-center text-xs text-on-surface-variant">Loading album…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-3 px-4 pb-20 relative">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 py-2 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>All albums</span>
      </button>

      <div className="pt-1 pb-2.5">
        <h2 className="text-lg sm:text-xl font-serif font-semibold text-on-surface">{album.title}</h2>
        <p className="text-xs text-on-surface-variant mt-1">
          {album.photoCount} photo{album.photoCount === 1 ? '' : 's'} · Anyone in the batch can add to this album.
        </p>
      </div>

      {/* No `capture` attribute — that forces straight-to-camera on many mobile
          browsers and hides the gallery picker. Plain accept="image/*" already
          gives the native picker a camera shortcut alongside "choose from library". */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFilesSelected} className="hidden" />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full border-[1.5px] border-dashed border-primary-container rounded p-3.5 bg-primary-container/10 hover:bg-primary-container/15 text-center transition-colors disabled:opacity-60"
      >
        <Camera className="w-5 h-5 mx-auto text-primary" />
        <div className="text-xs font-bold text-primary mt-1">{isUploading ? 'Uploading…' : 'Add your photos'}</div>
        <div className="text-[10px] text-on-surface-variant mt-0.5">Tap to upload from your phone · JPG/PNG/HEIC</div>
      </button>
      {uploadError && <p className="text-xs text-error mt-1.5">{uploadError}</p>}

      {album.photos.length === 0 ? (
        <div className="text-center py-10 px-4 space-y-1.5 mt-3">
          <h3 className="text-sm font-semibold text-on-surface">
            {album.isLiveDay ? 'Opens on reunion day' : 'No photos yet'}
          </h3>
          {!album.isLiveDay && <p className="text-xs text-on-surface-variant">Be the first to add one.</p>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-[3px] mt-3">
            {album.photos.map((photo) => (
              <button key={photo.id} type="button" onClick={() => setLightboxPhoto(photo)} className="aspect-square block">
                <img src={photo.thumbUrl} alt={photo.caption || ''} className="w-full h-full object-cover rounded-sm" />
              </button>
            ))}
          </div>

          {album.nextCursor && (
            <button
              type="button"
              onClick={handleLoadMore}
              className="block w-full sm:max-w-xs sm:mx-auto mt-4 py-2.5 rounded-full border border-outline-variant/40 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low"
            >
              Load more photos
            </button>
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="fixed bottom-24 right-4 @min-[700px]/app:bottom-6 z-30 w-12 h-12 rounded-full bg-primary text-on-primary shadow-soft flex items-center justify-center"
        title="Add photos"
      >
        <Plus className="w-5 h-5" />
      </button>

      {lightboxPhoto && (
        <Lightbox
          photo={lightboxPhoto}
          canDelete={isAdmin || lightboxPhoto.uploadedBy === currentUser.id}
          onClose={() => setLightboxPhoto(null)}
          onDelete={() => handleDeletePhoto(lightboxPhoto)}
        />
      )}
    </div>
  );
};
