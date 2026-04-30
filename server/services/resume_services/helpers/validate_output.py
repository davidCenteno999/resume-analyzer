from server.schemas.resume_schemas.resume_target_schema import ResumeStructured


def safe_extract(data):
    try:
        

        validated = ResumeStructured(**data)

        return validated.dict()

    except Exception as e:
        return {
            "error": "Failed to parse resume",
            "details": str(e)
        }