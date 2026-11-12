from typing import Optional
from fastapi import HTTPException
from pydantic import ValidationError

from server.services.ai_service.extract_resume_llm import ExtractResumeLLM
from server.services.ai_service.provider_factory import create_resume_parser
from server.services.ai_service.anthropic.llm_resume_parser import AnthropicProviderError
from server.services.resume_services.compare_data.compare_data import compareDataWithRequirements, matching_data_for_comparison
from server.services.resume_services.helpers.extract_text_resume import extract_text_from_pdf
from server.schemas.resume_schemas.job_requirements import JobRequirements
from server.schemas.resume_schemas.resume_target_schema import ResumeStructured


class CoreResumeService:
    def __init__(self):
        self.resume_parser = ExtractResumeLLM(create_resume_parser())

    async def process_resume(self, file, requirements: Optional[JobRequirements] = None, include_details=False):
        content = await file.read()
        raw_text = extract_text_from_pdf(content)
        if not raw_text or not raw_text.strip():
            raise HTTPException(status_code=422, detail="The PDF has no extractable text")
        if len(raw_text) > 30000:
            raise HTTPException(status_code=413, detail="The resume text exceeds the 30000-character limit")
        try:
            data = await self.resume_parser.extract_with_llm(raw_text)
        except AnthropicProviderError as exc:
            raise HTTPException(status_code=exc.status_code, detail=exc.public_message) from None
        try:
            data = ResumeStructured.model_validate(data).model_dump(exclude_unset=True)
        except (ValidationError, TypeError, ValueError):
            raise HTTPException(status_code=502, detail="AI provider returned invalid resume data") from None
        # Nullable fields are valid extraction results; the existing matcher expects
        # strings for degrees and integers for experience durations.
        matching_data = matching_data_for_comparison(data)
        compare_result = compareDataWithRequirements(matching_data, requirements, include_details=include_details)
        return {
            "filename": file.filename,
            "extracted_data": data,
            "compare_result": compare_result,
        }
