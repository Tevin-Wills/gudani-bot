import time
import logging

logger = logging.getLogger(__name__)


class TTLCache:
    def __init__(self, default_ttl: int = 300):
        self._store: dict[str, tuple] = {}
        self._default_ttl = default_ttl

    def _cleanup(self) -> None:
        now = time.time()
        expired = [k for k, (_, exp) in self._store.items() if exp <= now]
        for k in expired:
            del self._store[k]

    def get(self, key: str):
        self._cleanup()
        if key in self._store:
            value, expiry = self._store[key]
            if expiry > time.time():
                logger.info("Cache hit for key: %s", key[:50])
                return value
            del self._store[key]
        return None

    def set(self, key: str, value, ttl: int | None = None) -> None:
        self._cleanup()
        ttl = ttl if ttl is not None else self._default_ttl
        self._store[key] = (value, time.time() + ttl)


cache = TTLCache()
