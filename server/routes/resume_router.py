from fastapi import APIRouter, UploadFile
from fastapi.params import File

from server.services.resume_services.core_resume_service import CoreResumeService

router = APIRouter(prefix="/resume", tags=["Resume"])
core_service = CoreResumeService()

@router.post("/upload-resume")
async def upload_resume(file : UploadFile = File(...)):
    return await core_service.process_resume(file)