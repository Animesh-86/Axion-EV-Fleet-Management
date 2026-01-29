# emitters/rest_emitter.py

import httpx
from core.telemetry_builder import build_message


class RestEmitter:
    def __init__(self, endpoint_url: str):
        self.client = httpx.AsyncClient()
        self.url = endpoint_url

    async def emit(self, state):
        payload = build_message(state)
        try:
            await self.client.post(self.url, json=payload, timeout=1.0)
            print(f"[EMIT] {payload['vehicle_id']}")
        except (httpx.ConnectError, httpx.ConnectTimeout):
            # Backend not running — expected during local simulation
            print(f"[EMIT-SKIPPED] {payload['vehicle_id']} (backend offline)")
