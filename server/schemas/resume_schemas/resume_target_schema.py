from pydantic import BaseModel
from typing import List, Optional

class Experience(BaseModel):
    title: Optional[str]
    company: Optional[str]
    years: Optional[int]
    description: Optional[str]

class Education(BaseModel):
    degree: Optional[str]
    institution: Optional[str]
    years: Optional[str]

class ResumeStructured(BaseModel):
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    skills: List[str]
    experience: List[Experience]
    education: List[Education]