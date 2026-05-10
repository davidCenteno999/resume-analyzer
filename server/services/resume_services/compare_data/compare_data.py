
required_skills = ["python", "javascript", "sql", "aws", "docker"]

degree_requirements = ["Bachelor's Degree in Computer Science", "Master's Degree in Computer Science",
                       "Bachelor's Degree in Computer Engineering"]

experience_requirements = [
    {"title": "Software Engineer", "years": 2},
    {"title": "Backend Developer", "years": 3},
    {"title": "Software Developer", "years": 1}
]

def compareDataWithRequirements(data):
    skill_match = sum(skill in data.get("skills", []) for skill in required_skills)
    porcentage_skill_match = skill_match / len(required_skills) * 100

    degree_match = any(degree in data.get("education", [{}])[0].get("degree", "") for degree in degree_requirements)

    experience_match = sum(
        exp.get("title") == req["title"] and exp.get("years", 0) >= req["years"]
        for exp in data.get("experience", [])
        for req in experience_requirements
    )
    percentage_experience_match = experience_match / len(experience_requirements) * 100

    return {
        "skill_match": skill_match,
        "percentage_skill_match": porcentage_skill_match,
        "degree_match": degree_match,
        "experience_match": experience_match,
        "percentage_experience_match": percentage_experience_match
    }
