# ota/ota_scenarios.py

import random
from scenarios.base import Scenario
import asyncio

class OTATriggerScenario(Scenario):
    def __init__(self, probability: float = 0.01):
        self.probability = probability

    def apply(self, state, delta_time):
        if random.random() < self.probability:
            if hasattr(state, "vehicle"):
                asyncio.create_task(state.vehicle.trigger_ota())
