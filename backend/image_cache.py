import os
import time
import threading
import requests
from pathlib import Path

# Where cached images live on disk
CACHE_DIR = Path("image_cache")
CACHE_DIR.mkdir(exist_ok=True)

# How long a cached image stays fresh (seconds). 7 days.
CACHE_TTL = 7 * 24 * 60 * 60

# In-memory cache: { file_id: {"data": bytes, "mime": str, "ts": float} }
_memory_cache = {}
_memory_lock = threading.Lock()

# Drive thumbnail URL template
DRIVE_THUMB_URL = "https://drive.google.com/thumbnail?id={file_id}&sz=w256"


def _memory_get(file_id):
    """Return (data, mime) from memory cache, or None."""
    with _memory_lock:
        entry = _memory_cache.get(file_id)
        if not entry:
            return None
        if time.time() - entry["ts"] > CACHE_TTL:
            del _memory_cache[file_id]
            return None
        return entry["data"], entry["mime"]


def _memory_set(file_id, data, mime):
    with _memory_lock:
        _memory_cache[file_id] = {"data": data, "mime": mime, "ts": time.time()}


def _disk_path(file_id):
    return CACHE_DIR / f"{file_id}.bin"


def _disk_meta_path(file_id):
    return CACHE_DIR / f"{file_id}.meta"


def _disk_get(file_id):
    """Return (data, mime) from disk cache if fresh, else None."""
    p = _disk_path(file_id)
    m = _disk_meta_path(file_id)
    if not p.exists() or not m.exists():
        return None

    # Expiry check
    age = time.time() - p.stat().st_mtime
    if age > CACHE_TTL:
        try:
            p.unlink()
            m.unlink()
        except OSError:
            pass
        return None

    try:
        data = p.read_bytes()
        mime = m.read_text().strip() or "image/jpeg"
        return data, mime
    except OSError:
        return None


def _disk_set(file_id, data, mime):
    try:
        _disk_path(file_id).write_bytes(data)
        _disk_meta_path(file_id).write_text(mime)
    except OSError as e:
        print(f"⚠️  Could not write image cache for {file_id}: {e}")


def get_cached_logo(file_id, force_refresh=False):
    """
    Return (data, mime) for a Drive file id, using memory → disk → Drive.
    Raises Exception if the fetch fails and nothing is cached.
    """
    if not file_id:
        raise ValueError("file_id is required")

    if not force_refresh:
        # 1. Memory
        hit = _memory_get(file_id)
        if hit:
            return hit

        # 2. Disk
        hit = _disk_get(file_id)
        if hit:
            data, mime = hit
            _memory_set(file_id, data, mime)  # warm memory
            return hit

    # 3. Fetch from Drive
    url = DRIVE_THUMB_URL.format(file_id=file_id)
    resp = requests.get(url, timeout=8, allow_redirects=True)
    if resp.status_code != 200:
        raise Exception(f"Drive returned {resp.status_code} for {file_id}")

    data = resp.content
    mime = resp.headers.get("Content-Type", "image/jpeg")
    # Drive sometimes returns text/html on failure — guard against that
    if not mime.startswith("image/"):
        raise Exception(f"Drive returned non-image content-type: {mime}")

    _disk_set(file_id, data, mime)
    _memory_set(file_id, data, mime)
    return data, mime

def get_cached_image(file_id, force_refresh=False, size="w1600"):
    """
    Same as get_cached_logo, but lets you pick the Drive thumbnail size.
    Useful for news images that want larger resolution than logos.
    """
    if not file_id:
        raise ValueError("file_id is required")

    # Different sizes → separate cache keys so we don't overwrite a small logo
    # with a huge news image
    cache_key = f"{file_id}__{size}"

    if not force_refresh:
        hit = _memory_get(cache_key)
        if hit:
            return hit

        hit = _disk_get(cache_key)
        if hit:
            data, mime = hit
            _memory_set(cache_key, data, mime)
            return hit

    url = f"https://drive.google.com/thumbnail?id={file_id}&sz={size}"
    resp = requests.get(url, timeout=10, allow_redirects=True)
    if resp.status_code != 200:
        raise Exception(f"Drive returned {resp.status_code} for {file_id}")

    data = resp.content
    mime = resp.headers.get("Content-Type", "image/jpeg")
    if not mime.startswith("image/"):
        raise Exception(f"Drive returned non-image content-type: {mime}")

    _disk_set(cache_key, data, mime)
    _memory_set(cache_key, data, mime)
    return data, mime

def clear_cache(file_id=None):
    """Clear a specific file, or the entire cache if file_id is None."""
    global _memory_cache
    with _memory_lock:
        if file_id:
            # Remove the plain key and any size-suffixed variants
            for k in list(_memory_cache.keys()):
                if k == file_id or k.startswith(f"{file_id}__"):
                    _memory_cache.pop(k, None)
        else:
            _memory_cache = {}

    if file_id:
        # Remove disk files matching this id (any size suffix)
        for p in CACHE_DIR.glob(f"{file_id}*"):
            try:
                p.unlink()
            except OSError:
                pass
    else:
        for p in CACHE_DIR.glob("*"):
            try:
                p.unlink()
            except OSError:
                pass

def cache_stats():
    """Simple stats for a debug endpoint."""
    with _memory_lock:
        mem_count = len(_memory_cache)
    disk_files = list(CACHE_DIR.glob("*.bin"))
    total_bytes = sum(f.stat().st_size for f in disk_files)
    return {
        "memory_entries": mem_count,
        "disk_entries": len(disk_files),
        "disk_size_bytes": total_bytes,
        "disk_size_mb": round(total_bytes / 1024 / 1024, 2),
    }