# main.py

import asyncio

from core.vehicle import Vehicle
from core.vehicle_state import VehicleState
from scenarios.normal_drive import NormalDriveScenario
from scenarios.network_dropout import NetworkDropoutScenario
from ota.ota_scenarios import OTATriggerScenario
from emitters.rest_emitter import RestEmitter


async def main():
    vehicles = []

    for i in range(5):
        state = VehicleState(
            vehicle_id=f"EV-{i}",
            vendor="SIMULATED",
            speed_kmph=0.0,
            battery_soc_pct=90.0,
            battery_temp_c=30.0,
            motor_temp_c=35.0,
            odometer_km=1000.0,
            online=True,
            packet_loss_pct=0.1,
            signal_strength=-70,
            sequence_number=0,
            last_timestamp=None
        )

        emitter = RestEmitter("http://localhost:8080/api/v1/telemetry")
        scenarios = [
            NormalDriveScenario(),
            OTATriggerScenario(probability=0.2),
            NetworkDropoutScenario()
        ]

        vehicles.append(Vehicle(state, scenarios, emitter))

    await asyncio.gather(*(v.run() for v in vehicles))


if __name__ == "__main__":
    asyncio.run(main())
