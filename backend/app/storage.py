"""Local-disk storage for Photo Wall uploads.

Deliberately not object storage / Pillow-based: the browser pre-resizes every
upload into a full + thumb JPEG pair (see src/utils/imageResize.ts) before it
ever reaches the server, so this module just needs to persist bytes under a
configurable directory. That directory can be a plain container path (photos
lost on redeploy) or a mounted Railway volume (durable) with zero code change
either way.
"""

from pathlib import Path

from app.config import get_settings


def _albums_root() -> Path:
    return Path(get_settings().uploads_dir) / "albums"


def _album_dir(album_id: str) -> Path:
    return _albums_root() / album_id


def save_photo_files(album_id: str, photo_id: str, full_bytes: bytes, thumb_bytes: bytes) -> tuple[str, str]:
    """Writes the full + thumb JPEGs for one photo, returns (storage_key, thumb_key)."""
    album_dir = _album_dir(album_id)
    album_dir.mkdir(parents=True, exist_ok=True)

    full_key = f"albums/{album_id}/{photo_id}_full.jpg"
    thumb_key = f"albums/{album_id}/{photo_id}_thumb.jpg"

    (Path(get_settings().uploads_dir) / full_key).write_bytes(full_bytes)
    (Path(get_settings().uploads_dir) / thumb_key).write_bytes(thumb_bytes)

    return full_key, thumb_key


def delete_photo_files(storage_key: str, thumb_key: str) -> None:
    for key in (storage_key, thumb_key):
        if is_external_url(key):
            continue
        path = Path(get_settings().uploads_dir) / key
        path.unlink(missing_ok=True)


def is_external_url(key: str) -> bool:
    return key.startswith("http://") or key.startswith("https://")


def resolve_url(key: str | None) -> str | None:
    if not key:
        return None
    if is_external_url(key):
        return key
    return f"/uploads/{key}"


def ensure_uploads_dir() -> None:
    _albums_root().mkdir(parents=True, exist_ok=True)
