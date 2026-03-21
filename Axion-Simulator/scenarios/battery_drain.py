# scenarios/battery_drain.py

from scenarios.base import Scenario


class BatteryDrainScenario(Scenario):
    def __init__(self, drain_rate_per_sec: float):
        self.drain_rate = drain_rate_per_sec

    def apply(self, state, delta_time):
        drain = self.drain_rate * delta_time
        state.battery_soc_pct = max(0.0, state.battery_soc_pct - drain)
