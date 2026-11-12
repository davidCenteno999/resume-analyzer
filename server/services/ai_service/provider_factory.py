import os

from dotenv import load_dotenv

load_dotenv()


class LLMConfigurationError(ValueError):
    pass


def create_resume_parser():
    provider = os.getenv("LLM_PROVIDER", "github_models").strip().lower()
    if provider == "anthropic":
        if not os.getenv("ANTHROPIC_API_KEY"):
            raise LLMConfigurationError("ANTHROPIC_API_KEY is required for LLM_PROVIDER=anthropic")
        from server.services.ai_service.anthropic.llm_resume_parser import AnthropicResumeParser
        return AnthropicResumeParser()
    if provider == "github_models":
        if not os.getenv("GITHUB_TOKEN"):
            raise LLMConfigurationError("GITHUB_TOKEN is required for LLM_PROVIDER=github_models")
        from server.services.ai_service.github_models.llm_resume_parser import GitHubModelsResumeParser
        return GitHubModelsResumeParser()
    if provider == "openai":
        if not os.getenv("OPENAI_API_KEY"):
            raise LLMConfigurationError("OPENAI_API_KEY is required for LLM_PROVIDER=openai")
        from server.services.ai_service.open_ai.llm_resume_parser import OpenAIResumeParser
        return OpenAIResumeParser()
    if provider == "gemini":
        if not os.getenv("GEMINI_API_KEY"):
            raise LLMConfigurationError("GEMINI_API_KEY is required for LLM_PROVIDER=gemini")
        from server.services.ai_service.gemini.llm_resume_parser import GeminiResumeParser
        return GeminiResumeParser()
    raise LLMConfigurationError(
        "Unsupported LLM_PROVIDER. Choose anthropic, github_models, openai, or gemini."
    )
