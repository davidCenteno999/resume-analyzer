import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change_me_in_prod")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hour
