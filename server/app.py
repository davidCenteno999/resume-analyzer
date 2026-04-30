from fastapi import FastAPI
from server.routes.user_route import router as user_router
from server.routes.resume_router import router as resume_router

def create_app():
    app = FastAPI()

    # Basic route
    @app.get("/")
    def main():
        return "ok"

    # Include routes
    app.include_router(user_router)
    app.include_router(resume_router)
    

    return app

app = create_app()