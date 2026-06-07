from pydantic import BaseModel, EmailStr
from typing import Optional
from server.schemas.user_schemas.user import User

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str  # user's id
    exp: Optional[int] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

