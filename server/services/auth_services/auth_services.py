

from fastapi import Depends, HTTPException , status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError


from server.schemas.user_schemas.user import User
from server.schemas.auth_schemas import RefreshTokenRequest, TokenResponse
from server.services.user_services import user_services
from server.services.user_services.user_services import UserService
from server.utils.jwt_utils import create_access_token, create_refresh_token, decode_refresh_token
from server.utils.password_utils import verify_password


class AuthService:
    def __init__(self, user_service: UserService):
        self.user_service = user_service

    @staticmethod
    async def authenticate(form_data: OAuth2PasswordRequestForm = Depends()):
        user = await UserService.get_user_by_email(form_data.username)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not await verify_password(form_data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        access_token = create_access_token({"sub": user["email"]})
        refresh_token = create_refresh_token({"sub": user["email"]})
       
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)
    
    @staticmethod
    async def refresh_token(request: RefreshTokenRequest):
        """
        Refresh access token.
        """
        try:
            payload = decode_refresh_token(request.refresh_token)
            email = payload.get("sub")
            if email is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token({"sub": email})
        refresh_token_new = create_refresh_token({"sub": email})
        return TokenResponse(access_token=access_token, refresh_token=refresh_token_new)
