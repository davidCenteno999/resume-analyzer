from fastapi import APIRouter
from server.schemas.user_schemas.user import User
from server.schemas.user_schemas.user_create import UserCreate

router = APIRouter(prefix="/users", tags=["Users"])
from server.services.user_services.user_services import UserService

@router.post("/", response_model=dict)
async def create_user(user: UserCreate):
    """
    Register a new user via the service layer.
    Returns MongoDB user document ID on success.
    """
    user_id = await UserService.register(user)
    return {"id": user_id}


@router.get("/{user_id}", response_model=User)
def get_user(user_id: int):
    return {
        "id": user_id,
        "username": "example_user",
        "email": "example@gmail.com",
        "created_at": "2026-04-16T12:00:00"
    }


@router.put("/{user_id}", response_model=User)
def update_user(user_id: int):
    return {
        "id": user_id,
        "username": "updated_user",
        "email": "updated@gmail.com",
        "created_at": "2026-04-16T12:00:00"
    }


@router.delete("/{user_id}")
def delete_user(user_id: int):
    return {"message": f"User {user_id} deleted successfully"}
