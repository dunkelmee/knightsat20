import React, { useEffect, useState } from 'react';
import { Images, Trash2 } from 'lucide-react';
import { Album, UserProfile } from '../../types';
import { deleteAlbum, fetchAlbums } from '../../api/client';
import { AvatarStack } from '../Avatar';
import { CreateAlbumModal } from './CreateAlbumModal';
import { AlbumDetail } from './AlbumDetail';

interface PhotoWallSectionProps {
  currentUser: UserProfile;
  isOrganizer: boolean;
}

const AlbumCard: React.FC<{
  album: Album;
  onOpen: () => void;
  canDelete: boolean;
  onDelete: () => void;
}> = ({ album, onOpen, canDelete, onDelete }) => {
  const [big, ...small] = album.recentThumbUrls;

  // The delete control is a SIBLING of the card, not a child: the card itself
  // is a button, and a button inside a button is invalid HTML — the inner one
  // never receives its own clicks reliably.
  return (
    <div className="relative">
    <button
      type="button"
      onClick={onOpen}
      className="w-full relative text-left p-3.5 bg-surface-container-lowest rounded-sm shadow-soft flex flex-col gap-3"
    >
      <div className="flex items-start gap-2.5">
        <span className="flex-1 font-serif text-heading leading-[1.15] text-on-surface">{album.title}</span>
        {album.isLiveDay && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-label font-semibold tracking-[0.12em] uppercase" style={{ background: 'rgba(176,86,79,.12)', border: '1px solid rgba(176,86,79,.34)', color: '#98443e' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5f4e] animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="flex gap-1.5 h-36">
        <div className="flex-[1.6] aspect-[4/3] bg-surface-container-high overflow-hidden">
          {big ? <img src={big} alt="" className="w-full h-full object-cover" /> : (
            <div className="w-full h-full flex items-center justify-center text-outline"><Images className="w-6 h-6" /></div>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          {[0, 1].map((i) => (
            <div key={i} className="flex-1 bg-surface-container-high overflow-hidden">
              {small[i] && <img src={small[i]} alt="" className="w-full h-full object-cover" />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2.5 pt-2.5 border-t border-dashed border-on-surface/15">
        <span className="font-mono text-label tracking-[0.1em] uppercase text-on-surface-variant/60">
          {album.photoCount} photos · {album.contributorCount} contributor{album.contributorCount === 1 ? '' : 's'}
        </span>
        {album.contributors.length > 0 && (
          <AvatarStack people={album.contributors} total={album.contributorCount} size={22} />
        )}
      </div>
    </button>

      {/* Only ever shown on an empty album, which is also the only case where
          the footer's right-hand slot is free — an album with no photos has no
          contributors, so there is no avatar stack to collide with. */}
      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          title={`Delete the empty album "${album.title}"`}
          aria-label={`Delete the empty album ${album.title}`}
          className="absolute bottom-3 right-3 p-1.5 rounded-full text-error hover:bg-error-container/40 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export const PhotoWallSection: React.FC<PhotoWallSectionProps> = ({ currentUser, isOrganizer }) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadAlbums = async () => setAlbums(await fetchAlbums());

  // Organizers can clear away albums nobody filled. Deliberately limited to
  // empty ones: albums are collaborative, so deleting one with photos in it
  // would be throwing away other people's uploads.
  const handleDeleteAlbum = async (album: Album) => {
    if (!window.confirm(`Delete the empty album "${album.title}"? This can't be undone.`)) return;
    await deleteAlbum(album.id);
    setAlbums((prev) => prev.filter((a) => a.id !== album.id));
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadAlbums();
      setIsLoading(false);
    })();
  }, []);

  if (selectedAlbumId) {
    return (
      <AlbumDetail
        albumId={selectedAlbumId}
        currentUser={currentUser}
        isOrganizer={isOrganizer}
        onBack={() => {
          setSelectedAlbumId(null);
          loadAlbums();
        }}
      />
    );
  }

  return (
    <div id="photowall-container" className="max-w-5xl @min-[700px]/app:max-w-[1180px] mx-auto py-6 px-4 @min-[700px]/app:px-8 space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex-shrink-0 px-4.5 py-2.5 rounded-full bg-primary text-on-primary text-body font-bold shadow-soft whitespace-nowrap"
        >
          + New album
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-body text-on-surface-variant">Loading albums…</div>
      ) : albums.length === 0 ? (
        <div className="text-center py-13 px-5 rounded border-[1.5px] border-dashed border-on-surface/25 bg-white/40 space-y-2.5">
          <Images className="w-6 h-6 mx-auto text-on-surface-variant/60" />
          <h3 className="font-serif text-title text-on-surface">No albums yet</h3>
          <p className="text-body text-on-surface-variant max-w-[40ch] mx-auto">
            Start the first one for the batch to fill together.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="mt-1 inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-primary hover:opacity-90 text-on-primary text-body font-bold shadow-soft"
          >
            + Create an album
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 @min-[640px]/app:grid-cols-2 @min-[700px]/app:grid-cols-[repeat(auto-fit,minmax(258px,1fr))] gap-4 @min-[700px]/app:gap-5">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onOpen={() => setSelectedAlbumId(album.id)}
              canDelete={isOrganizer && album.photoCount === 0}
              onDelete={() => handleDeleteAlbum(album)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateAlbumModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(album) => {
            setAlbums((prev) => [album, ...prev]);
            setShowCreateModal(false);
            setSelectedAlbumId(album.id);
          }}
        />
      )}
    </div>
  );
};
