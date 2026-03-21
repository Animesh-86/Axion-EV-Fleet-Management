# profiles/loader.py

from profiles.base_profile import VehicleProfile

# Default vehicle profiles matching common EV archetypes
_PROFILES = {
    "sedan": VehicleProfile(name="sedan", max_speed_kmph=180, efficiency_km_per_kwh=6.5),
    "suv": VehicleProfile(name="suv", max_speed_kmph=160, efficiency_km_per_kwh=5.0, base_temp_max=38.0),
    "van": VehicleProfile(name="van", max_speed_kmph=140, efficiency_km_per_kwh=4.2, base_temp_max=40.0),
}


def load_profiles() -> dict[str, VehicleProfile]:
    """Return the built-in vehicle profile catalogue."""
    return dict(_PROFILES)


def get_profile(name: str) -> VehicleProfile:
    """Return a specific profile by name, falling back to sedan."""
    return _PROFILES.get(name, _PROFILES["sedan"])
