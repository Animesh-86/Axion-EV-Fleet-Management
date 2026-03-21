import asyncio
import os
import random
import yaml

from core.vehicle import Vehicle
from core.vehicle_state import VehicleState
from scenarios.normal_drive import NormalDriveScenario
from scenarios.network_dropout import NetworkDropoutScenario
from scenarios.battery_drain import BatteryDrainScenario
from scenarios.temp_spike import TempSpikeScenario
from ota.ota_scenarios import OTATriggerScenario
from emitters.rest_emitter import RestEmitter

async def main():
    with open("config/fleet.yaml", "r") as f:
        config = yaml.safe_load(f)

    # Read configuration sections with defaults
    backend_cfg = config.get("backend", {})
    sim_cfg = config.get("simulation", {})
    profiles_cfg = config.get("profiles", {})
    scenarios_cfg = config.get("scenarios", {})

    backend_url = os.environ.get("AXION_BACKEND_URL", backend_cfg.get("url", "http://localhost:8080/api/v1/telemetry"))
    rest_timeout = backend_cfg.get("timeout_seconds", 1.0)
    tick_interval = sim_cfg.get("tick_interval_seconds", 1.0)
    odo_range = sim_cfg.get("odometer_range_km", [5000, 50000])
    default_packet_loss = sim_cfg.get("packet_loss_pct", 0.1)
    default_signal = sim_cfg.get("signal_strength_dbm", -70)
    motor_offset = sim_cfg.get("motor_temp_offset_c", 5.0)

    # Scenario defaults
    ota_cfg = scenarios_cfg.get("ota", {})
    nd_cfg = scenarios_cfg.get("network_dropout", {})
    bd_cfg = scenarios_cfg.get("battery_drain", {})
    ts_cfg = scenarios_cfg.get("temp_spike", {})

    vehicles = []

    # Expand auto_generate entries into the vehicle list
    vehicle_configs = list(config.get("vehicles", []))
    for gen in config.get("auto_generate", []):
        prefix = gen.get("prefix", "auto")
        start = gen.get("start", 1)
        count = gen.get("count", 10)
        profile = gen.get("profile", "sedan_standard")
        scenario = gen.get("scenario", "normal")
        for i in range(start, start + count):
            vehicle_configs.append({
                "id": f"{prefix}-{i:03d}",
                "profile": profile,
                "scenario": scenario,
            })

    for v_conf in vehicle_configs:
        v_id = v_conf.get("id")
        profile = v_conf.get("profile", "sedan_standard")
        scenario_type = v_conf.get("scenario", "normal")

        # Profile-based defaults from config
        if "truck" in profile:
            p = profiles_cfg.get("truck", {})
        elif "sport" in profile:
            p = profiles_cfg.get("sport", {})
        else:
            p = profiles_cfg.get("default", {})

        t_range = p.get("temp_range", [25.0, 32.0])
        s_range = p.get("soc_range", [80.0, 95.0])
        sp_range = p.get("speed_range", [40.0, 80.0])

        temp_c = random.uniform(t_range[0], t_range[1])
        soc_pct = random.uniform(s_range[0], s_range[1])
        base_speed = random.uniform(sp_range[0], sp_range[1])

        state = VehicleState(
            vehicle_id=v_id,
            vendor="SIMULATED",
            speed_kmph=base_speed,
            battery_soc_pct=soc_pct,
            battery_temp_c=temp_c,
            motor_temp_c=temp_c + motor_offset,
            odometer_km=random.uniform(odo_range[0], odo_range[1]),
            online=True,
            packet_loss_pct=default_packet_loss,
            signal_strength=default_signal,
            sequence_number=0,
            last_timestamp=None
        )

        emitter = RestEmitter(backend_url, timeout=rest_timeout)

        # Base Scenarios
        scenarios = [
            NormalDriveScenario(
                speed_deltas=scenarios_cfg.get("normal_drive", {}).get("speed_deltas"),
                max_speed=scenarios_cfg.get("normal_drive", {}).get("max_speed_kmh"),
            ),
            OTATriggerScenario(probability=ota_cfg.get("trigger_probability", 0.2)),
            NetworkDropoutScenario(
                dropout_probability=nd_cfg.get("dropout_probability", 0.01),
                max_offline_seconds=nd_cfg.get("max_offline_seconds", 20),
            )
        ]

        # Dynamic Scenarios
        if scenario_type == "critical_temp":
            scenarios.append(TempSpikeScenario(
                spike_rate_per_sec=ts_cfg.get("spike_rate_per_sec", 0.5),
                max_temp=ts_cfg.get("max_temp_c", 75.0),
            ))
        elif scenario_type == "low_battery":
            scenarios.append(BatteryDrainScenario(drain_rate_per_sec=bd_cfg.get("critical_rate", 0.5)))
        else:
            scenarios.append(BatteryDrainScenario(drain_rate_per_sec=bd_cfg.get("normal_rate", 0.01)))

        vehicles.append(Vehicle(state, scenarios, emitter, tick_seconds=tick_interval))

    if not vehicles:
        print("No vehicles defined in config/fleet.yaml")
        return

    print(f"Starting simulation for {len(vehicles)} vehicles: {[v.state.vehicle_id for v in vehicles]}")
    await asyncio.gather(*(v.run() for v in vehicles), return_exceptions=True)


if __name__ == "__main__":
    asyncio.run(main())
