import asyncio
from copy import deepcopy
from datetime import datetime, timezone
from types import SimpleNamespace

import pytest

from server.schemas.resume_schemas.analysis import ComparisonResult
from server.schemas.resume_schemas.job_requirements import JobRequirements
from server.scripts.recalculate_matching import recalculate
from server.services.resume_services.compare_data.compare_data import compareDataWithRequirements
from server.services.resume_services.compare_data.normalization import (
    match_requirements,
    normalize_skill,
    unique_display_values,
)


def requirements(skills, tools=None):
    return JobRequirements(required_skills=skills, required_tools=tools or [],
                           degree_requirements=["BS"],
                           experience_requirements=[{"title": "Engineer", "years": 2}])


def compare(skills, extracted, tools=None, extracted_tools=None):
    return compareDataWithRequirements(
        {"skills": extracted, "tools": extracted_tools or [], "education": [], "experience": []},
        requirements(skills, tools), include_details=True,
    )


@pytest.mark.parametrize("required,extracted,matched,missing,percentage", [
    (["python", "javascript", "react", "angular"], ["Python", "JavaScript", "React", "Angular"],
     ["python", "javascript", "react", "angular"], [], 100),
    ([" Python ", "  React  "], ["python", "react"], [" Python ", "  React  "], [], 100),
    (["PYTHON", "JaVaScRiPt", "REACT"], ["Python", "JavaScript", "React"],
     ["PYTHON", "JaVaScRiPt", "REACT"], [], 100),
    (["Java"], ["JavaScript"], [], ["Java"], 0),
    (["C#", "C++", ".NET"], ["C", "C#", "ASP.NET"], ["C#"], ["C++", ".NET"], 100 / 3),
    (["Python", "python", "PYTHON", "React"], ["Python", "React"], ["Python", "React"], [], 100),
    (["python", "java", "javascript", "react", "angular", "next.js", "aws"],
     ["C#", "TypeScript", "JavaScript", "Python", "SQL", "HTML5", "CSS3", "ASP.NET Core",
      ".NET", "React", "Angular", "Node.js", "Entity Framework Core", "REST APIs",
      "PostgreSQL", "SQL Server", "MySQL", "Linux", "Windows", "Git"],
     ["python", "javascript", "react", "angular"], ["java", "next.js", "aws"], 400 / 7),
])
def test_skill_cases(required, extracted, matched, missing, percentage):
    result = compare(required, extracted)
    assert result["matched_skills"] == matched
    assert result["missing_skills"] == missing
    assert result["skill_match"] == len(matched)
    assert result["percentage_skill_match"] == pytest.approx(percentage)
    assert ComparisonResult.model_validate(result).model_dump()["matched_skills"] == matched


def test_normalization_unicode_whitespace_and_invalid_values():
    assert normalize_skill("  ＰＹＴＨＯＮ  ") == "python"
    assert normalize_skill("React\t  Native\n") == "react native"
    assert normalize_skill("Straße") == "strasse"
    assert normalize_skill(None) == normalize_skill(42) == normalize_skill("  ") == ""
    assert unique_display_values([None, " Python ", "PYTHON", "React", "react", ""]) == [" Python ", "React"]
    assert match_requirements(["C", "C#", "C++", "Java", "JavaScript", ".NET", "ASP.NET", "SQL", "NoSQL"],
                              ["C#", "JavaScript", "ASP.NET", "NoSQL"])[1] == ["C#", "JavaScript", "ASP.NET", "NoSQL"]
    assert match_requirements(None, ["Python"]) == ([], [], [])
    assert match_requirements([None, " "], ["Python"]) == ([], [], [])


def test_tools_use_same_rules_and_empty_category_is_not_evaluated():
    result = compare(["Python"], ["python", "PYTHON"],
                     [" Docker ", "docker", "C++", "React Native"],
                     ["DOCKER", "C++", " React   Native ", "docker"])
    assert result["evaluated_tools"] == [" Docker ", "C++", "React Native"]
    assert result["matched_tools"] == [" Docker ", "C++", "React Native"]
    assert result["missing_tools"] == []
    assert result["percentage_tool_match"] == 100
    assert result["evaluated_skills"] == ["Python"]
    assert result["skill_match"] == 1
    assert compare(["Python"], ["python"])["percentage_tool_match"] is None
    empty = SimpleNamespace(required_skills=[], required_tools=[], degree_requirements=[], experience_requirements=[])
    assert compareDataWithRequirements({"skills": [], "tools": [], "education": [], "experience": []}, empty, True)["percentage_skill_match"] == 0


def test_legacy_response_contains_corrected_count_without_new_keys():
    result = compareDataWithRequirements({"skills": ["Python", "PYTHON"], "education": [], "experience": []},
                                          requirements(["python", "PYTHON", "React"]))
    assert result["skill_match"] == 1
    assert result["percentage_skill_match"] == 50
    assert "matched_skills" not in result


def test_processing_pipeline_uses_corrected_matching_without_external_ai(monkeypatch):
    import server.services.resume_services.core_resume_service as core_module

    class FakeParser:
        async def extract_with_llm(self, prompt):
            return {"name": "Ada", "email": None, "phone": None,
                    "skills": ["Python", "JavaScript", "React", "Angular"], "tools": ["DOCKER"],
                    "education": [], "experience": []}

    monkeypatch.setattr(core_module, "create_resume_parser", lambda: FakeParser())
    monkeypatch.setattr(core_module, "extract_text_from_pdf", lambda content: "resume text")
    async def read_pdf():
        return b"mock PDF"
    file = SimpleNamespace(filename="Ada.pdf", read=read_pdf)
    result = asyncio.run(core_module.CoreResumeService().process_resume(
        file, requirements(["python", "java", "javascript", "react", "angular", "next.js", "aws"], ["docker"]),
        include_details=True,
    ))
    assert result["compare_result"]["matched_skills"] == ["python", "javascript", "react", "angular"]
    assert result["compare_result"]["percentage_skill_match"] == pytest.approx(400 / 7)
    assert result["compare_result"]["matched_tools"] == ["docker"]
    assert result["extracted_data"]["skills"][0] == "Python"


def test_historical_recalculation_is_dry_run_idempotent_and_preserves_record():
    document = {
        "_id": "record-1", "user_id": "owner-1", "created_at": datetime(2026, 1, 1, tzinfo=timezone.utc),
        "filename": "Ada.pdf", "requirements": requirements(["python", "PYTHON"], ["Docker"]).model_dump(),
        "extracted_data": {"name": "Ada", "email": None, "phone": None, "skills": ["Python"],
                           "tools": ["docker"], "education": [], "experience": []},
        "compare_result": {"skill_match": 0, "percentage_skill_match": 0, "degree_match": True,
                           "percentage_experience_match": 75, "overall_percentage": 93,
                           "custom_future_field": "keep"},
    }
    original = deepcopy(document)

    class Collection:
        def __init__(self):
            self.updates = 0
        def find(self, query, projection):
            assert query == {"user_id": "owner-1"}
            async def rows():
                yield document
            return rows()
        async def update_one(self, query, update):
            assert query["_id"] == document["_id"] and query["user_id"] == document["user_id"]
            assert query["compare_result"] == document["compare_result"]
            document["compare_result"] = update["$set"]["compare_result"]
            self.updates += 1
            return SimpleNamespace(modified_count=1)

    collection = Collection()
    assert asyncio.run(recalculate(collection, "owner-1")) == {"scanned": 1, "changed": 1, "updated": 0, "skipped": 0}
    assert document == original
    applied = asyncio.run(recalculate(collection, "owner-1", apply=True))
    assert applied == {"scanned": 1, "changed": 1, "updated": 1, "skipped": 0}
    assert document["compare_result"]["percentage_skill_match"] == 100
    assert document["compare_result"]["custom_future_field"] == "keep"
    assert document["compare_result"]["degree_match"] is True
    assert document["compare_result"]["percentage_experience_match"] == 75
    assert document["compare_result"]["overall_percentage"] == 93
    assert {k: v for k, v in document.items() if k != "compare_result"} == {k: v for k, v in original.items() if k != "compare_result"}
    assert asyncio.run(recalculate(collection, "owner-1", apply=True))["changed"] == 0
    assert collection.updates == 1
