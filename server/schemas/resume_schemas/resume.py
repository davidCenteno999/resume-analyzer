

from typing import Optional

from datetime import datetime

from server.schemas.resume_schemas.resume_base import ResumeBase


class Resume(ResumeBase):
    id: int
    user_id: int
    uploaded_at: datetime
    raw_text: Optional[str]  # extracted from PDF

    class Config:
        from_attributes = True