# core/clock.py

from datetime import datetime, timezone


class SimulationClock:
    """Provides a consistent time source for the simulation."""

    @staticmethod
    def now() -> datetime:
        return datetime.now(timezone.utc)

    @staticmethod
    def timestamp_iso() -> str:
        return datetime.now(timezone.utc).isoformat()
