from signal import signal
from dataclasses import dataclass 
from datetime import datetime
from typing import Optional

@dataclass
class VehicleState:
  vehicle_id: str
  vendor: str

  speed_kmph: float
  battery_soc_pct: float
  battery_temp_c: Optional[float]
  motor_temp_c: Optional[float]
  odometer_km: float
  
  online: bool
  packet_loss_pct: float
  signal_strength: int 
  sequence_number: int

  last_timestamp: datetime