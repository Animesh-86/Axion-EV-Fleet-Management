# main.py

import asyncio

from core.vehicle import Vehicle
from core.vehicle_state import VehicleState
from scenarios.normal_drive import NormalDriveScenario
from scenarios.network_dropout import NetworkDropoutScenario
from ota.ota_scenarios import OTATriggerScenario
from emitters.rest_emitter import RestEmitter


import yaml

async def main():
    with open("config/fleet.yaml", "r") as f:
        config = yaml.safe_load(f)

    vehicles = []

    for v_conf in config.get("vehicles", []):
        v_id = v_conf.get("id")
        
        # Default values
        temp_c = 30.0
        soc_pct = 90.0
        
        scenario = v_conf.get("scenario", "normal")
        if scenario == "critical_temp":
            temp_c = 60.0 # High temp trigger (Critical > 55)
        elif scenario == "low_battery":
            soc_pct = 25.0 # Warning battery (Warning < 30)
            
        state = VehicleState(
            vehicle_id=v_id,
            vendor="SIMULATED",
            speed_kmph=0.0,
            battery_soc_pct=soc_pct,
            battery_temp_c=temp_c,
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

    if not vehicles:
        print("No vehicles defined in config/fleet.yaml")
        return

    print(f"Starting simulation for {len(vehicles)} vehicles: {[v.state.vehicle_id for v in vehicles]}")
    await asyncio.gather(*(v.run() for v in vehicles))


if __name__ == "__main__":
    asyncio.run(main())
