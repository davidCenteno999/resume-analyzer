from fastapi import APIRouter
from server.schemas.user_schemas.user import User
from server.schemas.user_schemas.user_create import UserCreate

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=User)
def create_user(user: UserCreate):
    return {
        "id": 1,
        "username": user.username,
        "email": user.email,
        "created_at": "2026-04-16T12:00:00"
    }


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
