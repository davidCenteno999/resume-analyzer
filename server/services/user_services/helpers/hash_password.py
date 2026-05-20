import asyncio

import bcrypt
from fastapi.concurrency import run_in_threadpool

async def hashPassword(password: str) -> str:
    """
    Hashes a plaintext password using bcrypt in an asynchronous manner.
    Returns the hashed password as a string.
    """
    hashed_pw = await run_in_threadpool(
        bcrypt.hashpw,
        password.encode("utf-8"),
        bcrypt.gensalt()
    )
    return hashed_pw.decode("utf-8")