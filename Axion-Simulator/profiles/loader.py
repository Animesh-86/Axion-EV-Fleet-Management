# profiles/loader.py

from profiles.base_profile import VehicleProfile

# Default vehicle profiles matching common EV archetypes
_PROFILES = {
    "sedan": VehicleProfile(name="sedan", max_speed_kmph=180, efficiency_km_per_kwh=6.5),
    "suv": VehicleProfile(name="suv", max_speed_kmph=160, efficiency_km_per_kwh=5.0, base_temp_max=38.0),
    "van": VehicleProfile(name="van", max_speed_kmph=140, efficiency_km_per_kwh=4.2, base_temp_max=40.0),
}

# Aliases used by fleet config to map to internal profile keys
_ALIASES = {
    "sedan_standard": "sedan",
    "sedan_sport": "sedan",
    "truck_heavy": "van",
    "truck_light": "suv",
}


def load_profiles() -> dict[str, VehicleProfile]:
    """Return the built-in vehicle profile catalogue."""
    return dict(_PROFILES)


def resolve_profile_name(name: str) -> str:
    """Resolve a profile name or alias to an internal profile key."""
    if not name:
        return "sedan"
    if name in _PROFILES:
        return name
    return _ALIASES.get(name, "sedan")


def get_profile(name: str) -> VehicleProfile:
    """Return a specific profile by name or alias, falling back to sedan."""
    key = resolve_profile_name(name)
    return _PROFILES.get(key, _PROFILES["sedan"])
