from server.database import db
from motor.motor_asyncio import AsyncIOMotorDatabase
async def ensure_user_collection_and_index():
   
    collections = await db.list_collection_names()
    if "users" not in collections:
        await db.create_collection("users")
  
    await db["users"].create_index("email", unique=True)