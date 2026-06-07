from typing import List

from fastapi import APIRouter, Form, HTTPException, UploadFile
from fastapi.params import File
from pydantic import TypeAdapter, ValidationError

from server.services.resume_services.core_resume_service import CoreResumeService
from server.schemas.resume_schemas.job_requirements import (
    ExperienceRequirement,
    JobRequirements,
)

router = APIRouter(prefix="/resume", tags=["Resume"])
core_service = CoreResumeService()


@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    required_skills: str = Form(..., description='JSON-stringified list of strings, e.g. ["python","sql"]'),
    degree_requirements: str = Form(..., description='JSON-stringified list of strings, e.g. ["Bachelor\'s in CS"]'),
    experience_requirements: str = Form(..., description='JSON-stringified list of {title, years}, e.g. [{"title":"SWE","years":2}]'),
):
    try:
        skills = TypeAdapter(List[str]).validate_json(required_skills)
        degrees = TypeAdapter(List[str]).validate_json(degree_requirements)
        experiences = TypeAdapter(List[ExperienceRequirement]).validate_json(experience_requirements)
        requirements = JobRequirements(
            required_skills=skills,
            degree_requirements=degrees,
            experience_requirements=experiences,
        )
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())

    return await core_service.process_resume(file, requirements)
