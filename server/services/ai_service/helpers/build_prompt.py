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
      "years": int,
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
- Use only straight apostrophes (') and never curly apostrophes (’) for the degree field
- The "years" field in experience MUST be an integer representing the total duration
- Calculate years in experience by finding the difference between the start and end dates in the resume (e.g., "Jan 2020 - Mar 2023" = 3, "2019 - 2022" = 3, "Present" means until now)
- Return ONLY JSON, no explanation

Resume:
\"\"\"
{resume_text}
\"\"\"
"""