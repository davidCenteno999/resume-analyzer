from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

from server.schemas.resume_schemas.job_requirements import JobRequirements
from server.schemas.resume_schemas.resume_target_schema import ResumeStructured


class AnalysisSummary(BaseModel):
    id: str
    candidate_name: str
    filename: str
    created_at: datetime
    status: Literal["completed"]
    compare_result: "ComparisonResult"


class ComparisonResult(BaseModel):
    skill_match: int
    percentage_skill_match: float
    degree_match: bool
    experience_match: int
    percentage_experience_match: float
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    evaluated_skills: list[str] = Field(default_factory=list)
    matched_tools: list[str] = Field(default_factory=list)
    missing_tools: list[str] = Field(default_factory=list)
    evaluated_tools: list[str] = Field(default_factory=list)
    percentage_tool_match: float | None = None
    matched_degrees: list[str] = Field(default_factory=list)
    missing_degrees: list[str] = Field(default_factory=list)
    matched_experience: list[dict[str, Any]] = Field(default_factory=list)
    missing_experience: list[dict[str, Any]] = Field(default_factory=list)
    overall_percentage: float | None = None


class AnalysisDetail(AnalysisSummary):
    user_id: str
    requirements: JobRequirements
    extracted_data: ResumeStructured
    provider: str | None = None
    model: str | None = None
    duration_ms: int | None = None


class AnalysisPage(BaseModel):
    items: list[AnalysisSummary]
    total: int
    page: int
    page_size: int


class StatisticsResponse(BaseModel):
    timezone: Literal["UTC"]
    period: Literal["hourly", "daily", "weekly", "monthly"]
    summary: dict[str, int]
    buckets: list[dict[str, Any]]
