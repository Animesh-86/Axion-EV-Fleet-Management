# core/vehicle.py

import asyncio
from datetime import datetime
from typing import List

from core.vehicle_state import VehicleState
from scenarios.base import Scenario
from emitters.base import TelemetryEmitter
from ota.ota_client import OTAClient


class Vehicle:
    def __init__(
        self,
        state: VehicleState,
        scenarios: List[Scenario],
        emitter: TelemetryEmitter,
        tick_seconds: float = 1.0
    ):
        self.state = state
        self.scenarios = scenarios
        self.emitter = emitter
        self.tick_seconds = tick_seconds
        self.ota_client = OTAClient()
        # Link state back to vehicle so scenarios can trigger actions
        self.state.vehicle = self

    async def run(self):
        while True:
            now = datetime.utcnow()

            if self.state.last_timestamp is None:
                delta = 0.0
            else:
                delta = (now - self.state.last_timestamp).total_seconds()

            self.state.last_timestamp = now

            # Apply scenarios
            for scenario in self.scenarios:
                scenario.apply(self.state, delta)

            # Block emission if offline
            if not self.state.online:
                await asyncio.sleep(self.tick_seconds)
                continue

            # Emit telemetry
            await self.emitter.emit(self.state)

            await asyncio.sleep(self.tick_seconds)

    async def trigger_ota(self):
        await self.ota_client.start_update()
