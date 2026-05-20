from server.database import db
from typing import Optional

async def get_user_by_email(email: str) -> Optional[dict]:
    user = await db["users"].find_one({"email": email})
    return user
