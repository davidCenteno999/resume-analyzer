from server.services.ai_service.extract_resume_llm import ExtractResumeLLM
from server.services.ai_service.github_models.llm_resume_parser import GitHubModelsResumeParser
from server.services.resume_services.compare_data.compare_data import compareDataWithRequirements
from server.services.resume_services.helpers.extract_text_resume import extract_text_from_pdf

class CoreResumeService:
    def __init__(self):
        pass
        

    async def process_resume(self, file):
        # Extract text from the PDF
        content = await file.read()
        raw_text = extract_text_from_pdf(content)
        resume_parser = ExtractResumeLLM(GitHubModelsResumeParser())
        data = resume_parser.extract_with_llm(raw_text)
        compare_result = compareDataWithRequirements(data)
        return {
            "filename": file.filename,
            "extracted_data": data,
            "compare_result": compare_result
        }