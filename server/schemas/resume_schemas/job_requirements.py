from typing import List

from pydantic import BaseModel, Field


class ExperienceRequirement(BaseModel):
    title: str
    years: int = Field(ge=0)


class JobRequirements(BaseModel):
    required_skills: List[str] = Field(min_length=1)
    required_tools: List[str] = Field(default_factory=list)
    degree_requirements: List[str] = Field(min_length=1)
    experience_requirements: List[ExperienceRequirement] = Field(min_length=1)
