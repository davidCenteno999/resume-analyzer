import json
import os

from google import genai

# The client gets the API key from the environment variable `GEMINI_API_KEY`.

class GeminiResumeParser:
    def __init__(self):
        pass
    def extract_with_llm(self, prompt: str):
        client = genai.Client()

        response = client.models.generate_content(
            model="gemini-1.5-flash", contents= "You extract structured resume data.\n\n" + prompt
        )
        return json.loads(response.text)