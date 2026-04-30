

from pydantic import BaseModel


class ResumeBase(BaseModel):
    file_name: str