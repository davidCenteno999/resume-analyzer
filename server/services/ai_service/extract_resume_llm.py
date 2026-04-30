

from server.services.ai_service.helpers.build_prompt import build_prompt


class ExtractResumeLLM:
    def __init__(self, provider):
        self.provider = provider
    def extract_with_llm(self, resume_text: str):
        prompt = build_prompt(resume_text)
        return self.provider.extract_with_llm(prompt)

    


