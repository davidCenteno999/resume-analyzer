from openai import OpenAI
import json

class OpenAIResumeParser:
    def __init__(self):
        pass

    def extract_with_llm(prompt: str):

        client = OpenAI()

        response = client.chat.completions.create(
            model="gpt-4.1-mini", 
            messages=[
                {"role": "system", "content": "You extract structured resume data."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )

        content = response.choices[0].message.content

        return json.loads(content)