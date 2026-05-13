from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routes.user_route import router as user_router
from server.routes.resume_router import router as resume_router
import os

def create_app():
    app = FastAPI()

    # Basic route
    @app.get("/")
    def main():
        return "ok"

    # Include routes
    app.include_router(user_router)
    app.include_router(resume_router)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[os.environ["FRONTEND_URL"]],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    

    return app

app = create_app()