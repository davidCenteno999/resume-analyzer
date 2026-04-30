def build_prompt(resume_text: str) -> str:
    return f"""
You are an expert resume parser.

Extract structured information from the resume below.

Return ONLY valid JSON with this structure:

{{
  "name": string,
  "email": string,
  "phone": string,
  "skills": [string],
  "experience": [
    {{
      "title": string,
      "company": string,
      "years": string,
      "description": string
    }}
  ],
  "education": [
    {{
      "degree": string,
      "institution": string,
      "years": string
    }}
  ]
}}

Rules:
- Do NOT invent information
- If a field is missing, use null
- Keep skills concise (e.g., "python", "react")
- Return ONLY JSON, no explanation

Resume:
\"\"\"
{resume_text}
\"\"\"
"""