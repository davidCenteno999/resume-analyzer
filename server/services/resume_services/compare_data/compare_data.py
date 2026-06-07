from typing import Optional

from server.schemas.resume_schemas.job_requirements import JobRequirements


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


def compareDataWithRequirements(data, requirements: Optional[JobRequirements] = None):
    #reqs = requirements or DEFAULT_REQUIREMENTS
    reqs = requirements
    skill_match = sum(
        skill in data.get("skills", []) for skill in reqs.required_skills
    )
    percentage_skill_match = (
        skill_match / len(reqs.required_skills) * 100
        if reqs.required_skills
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

    return {
        "skill_match": skill_match,
        "percentage_skill_match": percentage_skill_match,
        "degree_match": degree_match,
        "experience_match": experience_match,
        "percentage_experience_match": percentage_experience_match,
    }
