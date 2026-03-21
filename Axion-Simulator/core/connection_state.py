# core/connection_state.py

from dataclasses import dataclass


@dataclass
class ConnectionState:
    online: bool
    packet_loss_pct: float
    signal_strength: int
