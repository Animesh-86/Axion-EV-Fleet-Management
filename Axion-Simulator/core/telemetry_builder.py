# core/telemetry_builder.py

from datetime import datetime


def build_message(state):
    state.sequence_number += 1

    return {
        "schema_version": "1.0",
        "vehicle_id": state.vehicle_id,
        "vendor": state.vendor,
        "timestamp": state.last_timestamp.isoformat() + "Z",
        "ingestion_ts": datetime.utcnow().isoformat() + "Z",
        "telemetry": {
            "speed_kmph": state.speed_kmph,
            "battery_soc_pct": state.battery_soc_pct,
            "battery_temp_c": state.battery_temp_c,
            "motor_temp_c": state.motor_temp_c,
            "odometer_km": state.odometer_km
        },
        "connection": {
            "packet_loss_pct": state.packet_loss_pct,
            "signal_strength": state.signal_strength,
            "sequence_number": state.sequence_number,
            "is_heartbeat": False
        }
    }
