import React, { useEffect, useState } from 'react';
import { Images } from 'lucide-react';
import { Album, UserProfile } from '../../types';
import { fetchAlbums } from '../../api/client';
import { CreateAlbumModal } from './CreateAlbumModal';
import { AlbumDetail } from './AlbumDetail';

interface PhotoWallSectionProps {
  currentUser: UserProfile;
  isAdmin: boolean;
}

const AlbumCard: React.FC<{ album: Album; onOpen: () => void }> = ({ album, onOpen }) => {
  const [big, ...small] = album.recentThumbUrls;
  const extraContributors = album.contributorCount - album.contributors.length;

  return (
    <button type="button" onClick={onOpen} className="text-left bg-surface-container-lowest rounded overflow-hidden border border-outline-variant/30 shadow-soft">
      <div className="relative h-36 grid grid-cols-[2fr_1fr] grid-rows-2 gap-0.5 bg-surface-container-high">
        {big ? (
          <img src={big} alt="" className="w-full h-full object-cover row-span-2" />
        ) : (
          <div className="row-span-2 flex items-center justify-center text-outline">
            <Images className="w-6 h-6" />
          </div>
        )}
        {[0, 1].map((i) => (
          <div key={i} className="bg-surface-container-high">
            {small[i] && <img src={small[i]} alt="" className="w-full h-full object-cover" />}
          </div>
        ))}
      </div>

      <div className="p-3">
        {album.isLiveDay && (
          <div className="inline-flex items-center gap-1.5 bg-primary-container/15 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            LIVE ON REUNION DAY
          </div>
        )}
        <h4 className="font-serif font-semibold text-sm text-on-surface">{album.title}</h4>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10.5px] text-on-surface-variant">
            {album.photoCount} photos · {album.contributorCount} contributor{album.contributorCount === 1 ? '' : 's'}
          </span>
          {album.contributors.length > 0 && (
            <div className="flex">
              {album.contributors.map((c, i) => (
                <span
                  key={i}
                  style={{ marginLeft: i === 0 ? 0 : -6 }}
                  className="w-5 h-5 rounded-full border-2 border-surface-container-lowest bg-tertiary text-on-tertiary flex items-center justify-center text-[8px] font-bold"
                >
                  {c.initials}
                </span>
              ))}
              {extraContributors > 0 && (
                <span style={{ marginLeft: -6 }} className="w-5 h-5 rounded-full border-2 border-surface-container-lowest bg-outline text-surface flex items-center justify-center text-[8px] font-bold">
                  +{extraContributors}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export const PhotoWallSection: React.FC<PhotoWallSectionProps> = ({ currentUser, isAdmin }) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadAlbums = async () => setAlbums(await fetchAlbums());

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
        isAdmin={isAdmin}
        onBack={() => {
          setSelectedAlbumId(null);
          loadAlbums();
        }}
      />
    );
  }

  return (
    <div id="photowall-container" className="max-w-5xl mx-auto py-5 px-4 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-serif font-semibold text-on-surface">Photo Wall</h2>
          <p className="text-xs text-on-surface-variant mt-1">Build albums together — shown live on reunion day.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex-shrink-0 px-3.5 py-2 rounded-full bg-primary text-on-primary text-xs font-bold shadow-soft whitespace-nowrap"
        >
          + Album
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs text-on-surface-variant">Loading albums…</div>
      ) : albums.length === 0 ? (
        <div className="text-center py-10 px-4 space-y-2.5">
          <div className="w-10 h-10 rounded-full bg-primary-container/20 text-on-primary-container flex items-center justify-center mx-auto border border-primary-container/50">
            <Images className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-on-surface">No albums yet</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">Start the first one for the batch to fill together.</p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-primary hover:opacity-90 text-on-primary text-xs font-semibold shadow-soft"
          >
            + Create an Album
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} onOpen={() => setSelectedAlbumId(album.id)} />
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
