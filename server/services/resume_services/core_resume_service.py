from server.services.ai_service.extract_resume_llm import ExtractResumeLLM
from server.services.ai_service.open_ai.llm_resume_parser import OpenAIResumeParser
from server.services.resume_services.helpers.extract_text_resume import extract_text_from_pdf

class CoreResumeService:
    def __init__(self):
        pass
        

    async def process_resume(self, file):
        # Extract text from the PDF
        content = await file.read()
        raw_text = extract_text_from_pdf(content)
        resume_parser = ExtractResumeLLM(OpenAIResumeParser())
        data = resume_parser.extract_with_llm(raw_text)
        return {
            "filename": file.filename,
            "extracted_data": data
        }