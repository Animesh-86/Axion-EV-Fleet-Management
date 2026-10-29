from enum import Enum


class OTAState(Enum):
    IDLE = "IDLE"
    DOWNLOADING = "DOWNLOADING"
    APPLYING = "APPLYING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
