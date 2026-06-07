from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from server.schemas.auth_schemas import TokenResponse, LoginRequest, RefreshTokenRequest
from server.services.auth_services.auth_services import AuthService
from server.services.user_services.user_services import UserService
from server.utils.jwt_utils import create_access_token, create_refresh_token, decode_refresh_token
from jose import JWTError


router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    User login returns JWT access token.
    """
    return await AuthService.authenticate(form_data)
    



@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: RefreshTokenRequest):
    return await AuthService.refresh_token(request)
    
