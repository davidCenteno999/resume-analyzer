
from server.dependencies.auth import get_user_email
from server.schemas.auth_schemas import TokenResponse
from fastapi import APIRouter, Depends
from server.schemas.user_schemas.user import User
from server.schemas.user_schemas.user_create import UserCreate

router = APIRouter(prefix="/users", tags=["Users"])
from server.services.user_services.user_services import UserService

@router.post("/", response_model=None, status_code=201)
async def create_user(user: UserCreate):
    """
    Register a new user via the service layer.
    Returns a TokenResponse with tokens and user data.
    """
    return await UserService.register(user)


@router.get("/me", response_model=User)
async def get_current_user_data(email: str = Depends(get_user_email)):
    """
    Get current user data.
    """
    user_data = await UserService.get_user_by_email(email)
    if user_data and "_id" in user_data:
        user_data["id"] = str(user_data.pop("_id"))
    return user_data

