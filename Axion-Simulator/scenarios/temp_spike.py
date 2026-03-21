# scenarios/temp_spike.py

from scenarios.base import Scenario

class TempSpikeScenario(Scenario):
    def __init__(self, spike_rate_per_sec: float = 0.5, max_temp: float = 75.0):
        self.spike_rate = spike_rate_per_sec
        self.max_temp = max_temp

    def apply(self, state, delta_time):
        spike = self.spike_rate * delta_time
        state.battery_temp_c = min(self.max_temp, state.battery_temp_c + spike)