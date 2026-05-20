import bcrypt
import asyncio

async def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Async bcrypt check
    return await asyncio.to_thread(
        bcrypt.checkpw,
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )
