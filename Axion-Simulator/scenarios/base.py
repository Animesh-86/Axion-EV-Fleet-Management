# scenarios/base.py

from abc import ABC, abstractmethod
from core.vehicle_state import VehicleState


class Scenario(ABC):

    @abstractmethod
    def apply(self, state: VehicleState, delta_time: float):
        pass
