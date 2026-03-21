# ota/ota_client.py

import random
import asyncio
from ota.ota_state import OTAState


class OTAClient:
    def __init__(self, failure_rate: float = 0.2, download_delay=(1, 3), apply_delay=(1, 2)):
        self.state = OTAState.IDLE
        self.failure_rate = failure_rate
        self.download_delay = download_delay
        self.apply_delay = apply_delay

    async def start_update(self):
        if self.state != OTAState.IDLE:
            return

        self.state = OTAState.DOWNLOADING
        print(f"[OTA] DOWNLOADING")
        await asyncio.sleep(random.uniform(*self.download_delay))

        self.state = OTAState.APPLYING
        print(f"[OTA] APPLYING")
        await asyncio.sleep(random.uniform(*self.apply_delay))

        if random.random() < self.failure_rate:
            self.state = OTAState.FAILED
        else:
            self.state = OTAState.SUCCESS

        print(f"[OTA] FINAL STATE = {self.state.value}")
