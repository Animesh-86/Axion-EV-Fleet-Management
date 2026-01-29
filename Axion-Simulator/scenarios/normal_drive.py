# scenarios/normal_drive.py

from scenarios.base import Scenario


class NormalDriveScenario(Scenario):
    def apply(self, state, delta_time):
        state.speed_kmph = min(80.0, state.speed_kmph + 0.5)
