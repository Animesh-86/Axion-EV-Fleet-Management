# core/telemetry_builder.py

from datetime import datetime


def build_message(state):
    state.sequence_number += 1

    return {
        "schemaVersion": "1.0",
        "vehicleId": state.vehicle_id,
        "vendor": state.vendor,
        "timestamp": state.last_timestamp.isoformat() + "Z",
        "ingestionTs": datetime.utcnow().isoformat() + "Z",
        "telemetry": {
            "speedKmph": state.speed_kmph,
            "batterySocPct": state.battery_soc_pct,
            "batteryTempC": state.battery_temp_c,
            "motorTempC": state.motor_temp_c,
            "odometerKm": state.odometer_km
        },
        "connection": {
            "packetLossPct": state.packet_loss_pct,
            "signalStrength": state.signal_strength,
            "sequenceNumber": state.sequence_number,
            "isHeartbeat": False
        }
    }
