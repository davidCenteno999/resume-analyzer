

from server.schemas.user_schemas.user_base import UserBase
from pydantic import EmailStr


class UserCreate(UserBase):
    password: str