from typing import Optional

from server.schemas.resume_schemas.job_requirements import JobRequirements
from server.services.resume_services.compare_data.normalization import match_requirements


DEFAULT_REQUIREMENTS = JobRequirements(
    required_skills=["python", "javascript", "sql", "aws", "docker"],
    degree_requirements=[
        "Bachelor's Degree in Computer Science",
        "Master's Degree in Computer Science",
        "Bachelor's Degree in Computer Engineering",
    ],
    experience_requirements=[
        {"title": "Software Engineer", "years": 2},
        {"title": "Backend Developer", "years": 3},
        {"title": "Software Developer", "years": 1},
    ],
)


def matching_data_for_comparison(data):
    """Keep nullable LLM values safe for the existing degree/year matcher."""
    return {
        **data,
        "education": [{**item, "degree": item.get("degree") or ""} for item in data.get("education") or []],
        "experience": [{**item, "years": item.get("years") or 0} for item in data.get("experience") or []],
    }


def compareDataWithRequirements(data, requirements: Optional[JobRequirements] = None, include_details=False):
    #reqs = requirements or DEFAULT_REQUIREMENTS
    reqs = requirements
    unique_skills, matched_skills, missing_skills = match_requirements(reqs.required_skills, data.get("skills"))
    unique_tools, matched_tools, missing_tools = match_requirements(reqs.required_tools, data.get("tools"))
    skill_match = len(matched_skills)
    percentage_skill_match = (
        skill_match / len(unique_skills) * 100
        if unique_skills
        else 0
    )

    education = data.get("education") or [{}]
    degree_match = any(
        degree in education[0].get("degree", "") for degree in reqs.degree_requirements
    )

    experience_match = sum(
        exp.get("title") == r.title and exp.get("years", 0) >= r.years
        for exp in data.get("experience", [])
        for r in reqs.experience_requirements
    )
    percentage_experience_match = (
        experience_match / len(reqs.experience_requirements) * 100
        if reqs.experience_requirements
        else 0
    )

    if not include_details:
        return {
            "skill_match": skill_match,
            "percentage_skill_match": percentage_skill_match,
            "degree_match": degree_match,
            "experience_match": experience_match,
            "percentage_experience_match": percentage_experience_match,
        }
    # Display labels remain exactly as submitted; keys exist only during matching.
    first_degree = education[0].get("degree", "") or ""
    matched_degrees = [d for d in reqs.degree_requirements if d in first_degree]
    matched_experience = [r.model_dump() for r in reqs.experience_requirements if any(
        e.get("title") == r.title and e.get("years", 0) >= r.years for e in data.get("experience") or []
    )]

    return {
        "skill_match": skill_match,
        "percentage_skill_match": percentage_skill_match,
        "degree_match": degree_match,
        "experience_match": experience_match,
        "percentage_experience_match": percentage_experience_match,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "evaluated_skills": unique_skills,
        "matched_tools": matched_tools,
        "missing_tools": missing_tools,
        "evaluated_tools": unique_tools,
        "percentage_tool_match": (len(matched_tools) / len(unique_tools) * 100) if unique_tools else None,
        "matched_degrees": matched_degrees,
        "missing_degrees": [d for d in reqs.degree_requirements if d not in matched_degrees],
        "matched_experience": matched_experience,
        "missing_experience": [r.model_dump() for r in reqs.experience_requirements if r.model_dump() not in matched_experience],
        "overall_percentage": None,
    }
