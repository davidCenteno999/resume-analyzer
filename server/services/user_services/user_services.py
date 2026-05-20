import asyncio
import bcrypt
from server.repositories.user_repository.create_user import create_user
from server.schemas.user_schemas.user_create import UserCreate
from fastapi import HTTPException

from server.services.user_services.helpers.ensure_user_collection import ensure_user_collection_and_index
from server.services.user_services.helpers.hash_password import hashPassword

from server.repositories.user_repository.get_user_by_email import get_user_by_email
from server.utils.password_utils import verify_password

class UserService:
    """
    Service layer for user-related operations.
    Handles registration logic and communicates with the repository layer.
    """
    @staticmethod
    async def register(user_in: UserCreate) -> str:
        # Hash the password asynchronously
        hashed_pw = await hashPassword(user_in.password)
        user_doc = {
            "username": user_in.username,
            "email": user_in.email,
            "password": hashed_pw
        }
        try:
            await ensure_user_collection_and_index()  # Ensure collection and index exist before inserting
            user_id = await create_user(user_doc)
            return user_id
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            print(f"Error in CoreUserService.register: {e}")  # Log the error for debugging
            raise HTTPException(status_code=500, detail="Failed to register user.")

    @staticmethod
    async def authenticate(email: str, password: str):
        user = await get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not await verify_password(password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return user