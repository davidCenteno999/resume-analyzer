from datetime import datetime, timezone
from time import monotonic
import os

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, Query, UploadFile
from pydantic import TypeAdapter, ValidationError
from pymongo.errors import DuplicateKeyError, PyMongoError

from server.dependencies.auth import get_user_email
from server.repositories import resume_analysis_repository as repository
from server.schemas.resume_schemas.analysis import AnalysisDetail, AnalysisPage, StatisticsResponse
from server.schemas.resume_schemas.job_requirements import ExperienceRequirement, JobRequirements
from server.services.resume_services.core_resume_service import CoreResumeService
from server.services.user_services.user_services import UserService


router = APIRouter(prefix="/api/resume-analyses", tags=["Resume analyses"])


async def current_user_id(email: str = Depends(get_user_email)):
    user = await UserService.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="User is no longer available")
    return str(user["_id"])


@router.post("", response_model=AnalysisDetail, status_code=201)
async def create_analysis(
    file: UploadFile = File(...),
    required_skills: str = Form(...),
    degree_requirements: str = Form(...),
    experience_requirements: str = Form(...),
    required_tools: str = Form("[]"),
    idempotency_key: str = Header(..., alias="Idempotency-Key"),
    user_id: str = Depends(current_user_id),
):
    if not file.filename or not file.filename.lower().endswith(".pdf") or file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=422, detail="A PDF file is required")
    if not idempotency_key.strip() or len(idempotency_key) > 128:
        raise HTTPException(status_code=422, detail="Invalid idempotency key")
    try:
        requirements = JobRequirements(
            required_skills=TypeAdapter(list[str]).validate_json(required_skills),
            required_tools=TypeAdapter(list[str]).validate_json(required_tools),
            degree_requirements=TypeAdapter(list[str]).validate_json(degree_requirements),
            experience_requirements=TypeAdapter(list[ExperienceRequirement]).validate_json(experience_requirements),
        )
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from None
    try:
        if idempotency_key:
            existing = await repository.get_by_key(user_id, idempotency_key)
            if existing:
                return existing
        started = monotonic()
        service = CoreResumeService()
        result = await service.process_resume(file, requirements, include_details=True)
        extracted = result["extracted_data"]
        now = datetime.now(timezone.utc)
        candidate = (extracted.get("name") or "").strip() or "Unknown candidate"
        document = {
            "user_id": user_id, "candidate_name": candidate,
            "candidate_name_normalized": candidate.casefold(), "candidate_grams": repository.name_grams(candidate),
            "filename": file.filename, "created_at": now, "status": "completed",
            "requirements": requirements.model_dump(), "extracted_data": extracted,
            "compare_result": result["compare_result"],
            "provider": os.getenv("LLM_PROVIDER", "github_models"),
            "model": getattr(service.resume_parser.provider, "model", None),
            "duration_ms": round((monotonic()-started)*1000),
        }
        if idempotency_key:
            document["idempotency_key"] = idempotency_key
        return await repository.create(document)
    except DuplicateKeyError:
        existing = await repository.get_by_key(user_id, idempotency_key)
        if existing:
            return existing
        raise HTTPException(status_code=503, detail="Could not save analysis") from None
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not save analysis") from None


@router.get("", response_model=AnalysisPage)
async def list_analyses(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100),
                        search: str = Query("", max_length=100), date_from: datetime | None = None,
                        date_to: datetime | None = None, user_id: str = Depends(current_user_id)):
    if any(value and value.utcoffset() is None for value in (date_from, date_to)):
        raise HTTPException(status_code=422, detail="Date filters require a timezone")
    return await repository.list_page(user_id, page, page_size, search, date_from, date_to)


@router.get("/statistics", response_model=StatisticsResponse)
async def get_statistics(period: str = Query("daily", pattern="^(hourly|daily|weekly|monthly)$"),
                         user_id: str = Depends(current_user_id)):
    return await repository.statistics(user_id, period)


@router.get("/{analysis_id}", response_model=AnalysisDetail)
async def get_analysis(analysis_id: str, user_id: str = Depends(current_user_id)):
    if not ObjectId.is_valid(analysis_id):
        raise HTTPException(status_code=422, detail="Invalid analysis ID")
    result = await repository.get_by_id(user_id, analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result
