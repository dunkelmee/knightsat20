import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, Plus } from 'lucide-react';
import { AlbumDetail as AlbumDetailType, Photo, UserProfile } from '../../types';
import { ApiError, deletePhoto, fetchAlbum, updatePhoto, uploadAlbumPhotos } from '../../api/client';
import { resizePhotoForUpload } from '../../utils/imageResize';
import { Lightbox } from './Lightbox';

interface AlbumDetailProps {
  albumId: string;
  currentUser: UserProfile;
  isOrganizer: boolean;
  onBack: () => void;
}

export const AlbumDetail: React.FC<AlbumDetailProps> = ({ albumId, currentUser, isOrganizer, onBack }) => {
  const [album, setAlbum] = useState<AlbumDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLoadingMoreRef = useRef(false);

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
    // Guarded because the lightbox also prefetches on reaching the last loaded
    // photo — without this, a swipe plus a tap could append the same page twice.
    if (!album?.nextCursor || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    try {
      const more = await fetchAlbum(albumId, album.nextCursor);
      setAlbum((prev) => (prev ? { ...more, photos: [...prev.photos, ...more.photos] } : more));
    } finally {
      isLoadingMoreRef.current = false;
    }
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Copy the files out BEFORE clearing the input. `e.target.files` is a live
    // FileList owned by the input, and WebKit's value reset empties that very
    // object in place — reading it afterwards yields zero files on iOS/Safari
    // and the upload silently never happens.
    const input = e.target;
    const files: File[] = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;

    setUploadError('');
    setIsUploading(true);
    try {
      let pairs: { full: Blob; thumb: Blob }[];
      try {
        pairs = await Promise.all(
          files.map(async (file) => {
            const { full, thumb } = await resizePhotoForUpload(file);
            return { full, thumb };
          })
        );
      } catch {
        // Decoding failed (e.g. a HEIC the browser can't read) — distinct from
        // the upload itself failing, so don't blame the file for a network error.
        setUploadError("Couldn't read one or more photos. Try a JPG or PNG instead.");
        return;
      }

      const uploaded = await uploadAlbumPhotos(albumId, pairs);
      setAlbum((prev) =>
        prev ? { ...prev, photos: [...uploaded, ...prev.photos], photoCount: prev.photoCount + uploaded.length } : prev
      );
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSavePhoto = async (
    photo: Photo,
    payload: { caption: string | null; taggedUserIds: string[] }
  ) => {
    const saved = await updatePhoto(albumId, photo.id, payload);
    setAlbum((prev) =>
      prev ? { ...prev, photos: prev.photos.map((p) => (p.id === saved.id ? saved : p)) } : prev
    );
  };

  const handleDeletePhoto = async (photo: Photo) => {
    await deletePhoto(albumId, photo.id);
    const remaining = (album?.photos ?? []).filter((p) => p.id !== photo.id);
    setAlbum((prev) => (prev ? { ...prev, photos: remaining, photoCount: prev.photoCount - 1 } : prev));
    // Stay in the lightbox on the photo that slid into this slot (or the new
    // last one); only close once the album is empty.
    setLightboxIndex((prev) =>
      prev === null || remaining.length === 0 ? null : Math.min(prev, remaining.length - 1)
    );
  };

  if (isLoading || !album) {
    return <div className="max-w-5xl @min-[700px]/app:max-w-[1180px] mx-auto py-10 px-4 @min-[700px]/app:px-8 text-center text-body text-on-surface-variant">Loading album…</div>;
  }

  return (
    <div className="max-w-5xl @min-[700px]/app:max-w-[1180px] mx-auto py-4 px-4 @min-[700px]/app:px-8 pb-20 @min-[700px]/app:pb-10 relative space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/55 backdrop-blur-md border border-white/85 text-body font-semibold text-on-surface"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-primary" />
        <span>Back to Photo Wall</span>
      </button>

      <div className="space-y-1.5">
        <span className="font-mono text-label tracking-[0.2em] uppercase" style={{ color: '#b0564f' }}>
          Album {album.isLiveDay ? '· reunion day' : ''}
        </span>
        <h2 className="font-serif text-title leading-[1.04] text-on-surface">{album.title}</h2>
        <span className="font-mono text-label tracking-[0.1em] uppercase text-on-surface-variant/60">
          {album.photoCount} photo{album.photoCount === 1 ? '' : 's'} · anyone in the batch can add
        </span>
      </div>

      {/* No `capture` attribute — that forces straight-to-camera on many mobile
          browsers and hides the gallery picker. Plain accept="image/*" already
          gives the native picker a camera shortcut alongside "choose from library". */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFilesSelected} className="hidden" />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full flex items-center justify-center gap-2.5 p-4.5 rounded bg-white/55 backdrop-blur-md border-[1.5px] border-dashed border-primary/40 text-center transition-colors disabled:opacity-60"
      >
        <Camera className="w-5 h-5 text-primary" />
        <span className="text-body font-bold text-primary">{isUploading ? 'Uploading…' : 'Upload photos'}</span>
      </button>
      {uploadError && <p className="text-body text-error">{uploadError}</p>}

      {album.photos.length === 0 ? (
        <div className="text-center py-13 px-5 rounded border-[1.5px] border-dashed border-on-surface/25 bg-white/40 space-y-2.5">
          {album.isLiveDay && (
            <span className="mx-auto w-13 h-13 rounded-full flex items-center justify-center" style={{ width: 52, height: 52, background: 'rgba(255,95,78,.12)', border: '1px solid rgba(255,95,78,.32)' }}>
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f4e] animate-pulse" />
            </span>
          )}
          <h3 className="font-serif text-title text-on-surface">
            {album.isLiveDay ? 'This album opens on reunion day.' : 'No photos yet'}
          </h3>
          <p className="text-body text-on-surface-variant max-w-[38ch] mx-auto">
            {album.isLiveDay ? 'Meanwhile, add an old photo to another album.' : 'Be the first to add one.'}
          </p>
        </div>
      ) : (
        <>
          {/* auto-FILL, not auto-fit: auto-fit collapses the empty tracks, which
              makes a lone photo stretch across the whole row. */}
          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))' }}>
            {album.photos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="relative p-2 pb-6.5 bg-surface-container-lowest shadow-soft"
              >
                <img src={photo.thumbUrl} alt={photo.caption || ''} className="w-full aspect-square object-cover" />
                {photo.caption && (
                  <span className="absolute bottom-1.5 left-0 right-0 text-center font-serif italic text-body text-on-surface-variant/70 truncate px-1">
                    {photo.caption}
                  </span>
                )}
              </button>
            ))}
          </div>

          {album.nextCursor && (
            <button
              type="button"
              onClick={handleLoadMore}
              className="mx-auto block px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/90 text-body font-semibold text-primary shadow-soft"
            >
              Shake out more photos
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

      {lightboxIndex !== null && album.photos[lightboxIndex] && (
        <Lightbox
          photos={album.photos}
          index={lightboxIndex}
          canDelete={isOrganizer || album.photos[lightboxIndex].uploadedBy === currentUser.id}
          canEdit={album.photos[lightboxIndex].uploadedBy === currentUser.id}
          onSavePhoto={(payload) => handleSavePhoto(album.photos[lightboxIndex], payload)}
          onIndexChange={(i) => {
            setLightboxIndex(i);
            // Landing on the last loaded photo pulls the next page in, so
            // swiping keeps going through a paginated album.
            if (i >= album.photos.length - 1) void handleLoadMore();
          }}
          onClose={() => setLightboxIndex(null)}
          onDelete={() => handleDeletePhoto(album.photos[lightboxIndex])}
        />
      )}
    </div>
  );
};
