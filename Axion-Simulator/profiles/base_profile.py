# profiles/base_profile.py

from dataclasses import dataclass


@dataclass
class VehicleProfile:
    """Defines the operating characteristics of a vehicle type."""
    name: str
    max_soc: float = 100.0
    min_soc: float = 0.0
    base_temp_min: float = 20.0
    base_temp_max: float = 35.0
    max_speed_kmph: float = 180.0
    efficiency_km_per_kwh: float = 6.5
