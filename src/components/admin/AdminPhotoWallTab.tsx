import React, { useEffect, useState } from 'react';
import { Trash2, Star, Images } from 'lucide-react';
import { Album } from '../../types';
import { deleteAlbum, fetchAlbums, updateAlbum } from '../../api/client';

export const AdminPhotoWallTab: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => setAlbums(await fetchAlbums());

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, []);

  const handleToggleLive = async (album: Album) => {
    await updateAlbum(album.id, { isLiveDay: !album.isLiveDay });
    await load();
  };

  const handleDelete = async (album: Album) => {
    if (!window.confirm(`Delete "${album.title}" and all ${album.photoCount} of its photos? This can't be undone.`)) return;
    await deleteAlbum(album.id);
    setAlbums((prev) => prev.filter((a) => a.id !== album.id));
  };

  if (isLoading) {
    return <div className="text-center py-10 text-xs text-on-surface-variant">Loading albums…</div>;
  }

  return (
    <div className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 shadow-soft space-y-3">
      <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
        <Images className="w-4 h-4 text-primary" />
        <h3 className="text-sm sm:text-base font-serif font-semibold text-on-surface">
          Photo Wall Moderation ({albums.length})
        </h3>
      </div>

      {albums.length === 0 ? (
        <p className="text-xs text-on-surface-variant text-center py-6">No albums yet.</p>
      ) : (
        <div className="space-y-2">
          {albums.map((album) => (
            <div
              key={album.id}
              className="p-3 rounded bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-semibold text-xs text-on-surface truncate">{album.title}</span>
                  {album.isLiveDay && (
                    <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary-container/15 text-primary">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">
                  {album.photoCount} photos · {album.contributorCount} contributors
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleLive(album)}
                  title={album.isLiveDay ? 'Unset as live-day album' : 'Set as live-day album'}
                  className={`p-1.5 rounded transition-colors ${
                    album.isLiveDay
                      ? 'text-primary bg-primary-container/15'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(album)}
                  title="Delete album"
                  className="p-1.5 rounded text-error hover:bg-error-container/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
