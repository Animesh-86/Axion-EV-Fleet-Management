# scenarios/normal_drive.py

import random
from scenarios.base import Scenario

DEFAULT_DELTAS = [-1.5, -0.5, 0.0, 0.5, 0.5, 1.0]
DEFAULT_MAX_SPEED = 120.0


class NormalDriveScenario(Scenario):
    def __init__(self, speed_deltas=None, max_speed=None):
        self.speed_deltas = speed_deltas or DEFAULT_DELTAS
        self.max_speed = max_speed or DEFAULT_MAX_SPEED

    def apply(self, state, delta_time):
        # Realistic speed variation: accelerate, cruise, or decelerate
        change = random.choice(self.speed_deltas)
        state.speed_kmph = max(0.0, min(self.max_speed, state.speed_kmph + change))
