from typing import Optional

from fastapi import Depends
from server.database import db
from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase

async def get_users_collection() -> AsyncIOMotorDatabase:
    print(db["users"])  # Debug: Check if collection is accessible
    return db["users"]


async def create_user(user_doc: dict) -> str:
    """
    Insert a user document into the MongoDB 'users' collection after checking email uniqueness.
    Returns the inserted user's MongoDB _id as a string.
    Raises ValueError if email already exists.
    """
    users_collection = await get_users_collection()

    # Check for email uniqueness
    existing_user = await users_collection.find_one({"email": user_doc["email"]})
    if existing_user:
        raise ValueError("Email already in use.", 400)

    result = await users_collection.insert_one(user_doc)
    return str(result.inserted_id)
