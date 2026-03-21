# emitters/rest_emitter.py

import asyncio
import httpx
from core.telemetry_builder import build_message

# Shared client with aggressive connection pooling
_shared_client = None
_emit_count = 0


def _get_client(timeout: float):
    global _shared_client
    if _shared_client is None:
        _shared_client = httpx.AsyncClient(
            limits=httpx.Limits(max_connections=200, max_keepalive_connections=100),
            timeout=httpx.Timeout(timeout, connect=2.0),
        )
    return _shared_client


class RestEmitter:
    def __init__(self, endpoint_url: str, timeout: float = 1.0):
        self.url = endpoint_url
        self.timeout = timeout

    async def emit(self, state):
        global _emit_count
        payload = build_message(state)
        client = _get_client(self.timeout)
        try:
            await client.post(self.url, json=payload)
            _emit_count += 1
            if _emit_count % 5000 == 0:
                print(f"[EMIT] {_emit_count} events sent")
        except (httpx.ConnectError, httpx.ConnectTimeout, httpx.ReadTimeout, httpx.HTTPStatusError, httpx.ReadError):
            pass
