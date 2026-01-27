import random
from datetime import datetime
from scenarios.base import Scenario


class NetworkDropoutScenario(Scenario):
    def __init__(
        self,
        dropout_probability: float = 0.02,
        max_offline_seconds: int = 20
    ):
        self.dropout_probability = dropout_probability
        self.max_offline_seconds = max_offline_seconds
        self.offline_since = None

    def apply(self, state, delta_time):
        now = state.last_timestamp

        # Trigger dropout
        if state.online and random.random() < self.dropout_probability:
            state.online = False
            self.offline_since = now
            return

        # Stay offline
        if not state.online:
            elapsed = (now - self.offline_since).total_seconds()
            state.packet_loss_pct = 100.0
            state.signal_strength = -120

            if elapsed >= self.max_offline_seconds:
                # Reconnect
                state.online = True
                state.packet_loss_pct = random.uniform(0.1, 1.0)
                state.signal_strength = random.randint(-85, -65)


        print(state.vehicle_id, state.online)
