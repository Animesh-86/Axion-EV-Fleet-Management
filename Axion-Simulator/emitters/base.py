# emitters/base.py

from abc import ABC, abstractmethod
from core.vehicle_state import VehicleState


class TelemetryEmitter(ABC):

    @abstractmethod
    async def emit(self, state: VehicleState):
        pass
