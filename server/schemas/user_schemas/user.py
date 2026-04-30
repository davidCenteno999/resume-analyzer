
from datetime import datetime

from server.schemas.user_schemas.user_base import UserBase



class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True