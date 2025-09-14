from pydantic import BaseModel
from typing import List, Optional
import datetime
from enum import Enum

class SeverityLevel(str, Enum):
    INFO = "info"
    CAUTION = "caution"
    WARNING = "warning"

class Alert(BaseModel):
    id: str
    source: str
    title: str
    content: str
    simplified_content: Optional[str]
    severity: SeverityLevel
    color: str
    tips: Optional[List[str]]
    timestamp: datetime.datetime
    location: str
    is_all_clear: bool
