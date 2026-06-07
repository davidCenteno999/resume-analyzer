
from datetime import datetime
from typing import Optional

from server.schemas.user_schemas.user_base import UserBase



class User(UserBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True