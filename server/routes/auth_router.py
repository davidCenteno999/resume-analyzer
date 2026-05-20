from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from server.schemas.auth_schemas import TokenResponse, LoginRequest
from server.services.user_services.user_services import UserService
from server.utils.jwt_utils import create_access_token
from server.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    User login returns JWT access token.
    """
    user = await UserService.authenticate(form_data.username, form_data.password)
    token = create_access_token({"sub": user["email"]})
    return TokenResponse(access_token=token)

@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    """
    User info for the current auth token
    """
    # Don't return password hash!
    user_safe = {k: v for k, v in current_user.items() if k != "password"}
    return user_safe
