

import asyncio
import inspect

from server.services.ai_service.helpers.build_prompt import build_prompt


class ExtractResumeLLM:
    def __init__(self, provider):
        self.provider = provider
    async def extract_with_llm(self, resume_text: str):
        prompt = build_prompt(resume_text)
        method = self.provider.extract_with_llm
        if inspect.iscoroutinefunction(method):
            return await method(prompt)
        return await asyncio.to_thread(method, prompt)

    


