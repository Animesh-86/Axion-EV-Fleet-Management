# ota/ota_client.py

import random
import asyncio
from ota.ota_state import OTAState


class OTAClient:
    def __init__(self, failure_rate: float = 0.2):
        self.state = OTAState.IDLE
        self.failure_rate = failure_rate

    async def start_update(self):
        if self.state != OTAState.IDLE:
            return

        self.state = OTAState.DOWNLOADING
        print(f"[OTA] DOWNLOADING")
        await asyncio.sleep(random.uniform(1, 3))

        self.state = OTAState.APPLYING
        print(f"[OTA] APPLYING")
        await asyncio.sleep(random.uniform(1, 2))

        if random.random() < self.failure_rate:
            self.state = OTAState.FAILED
        else:
            self.state = OTAState.SUCCESS

        print(f"[OTA] FINAL STATE = {self.state.value}")
