import asyncio
from datetime import datetime, timezone

import httpx
import pytest
from pymongo.errors import ServerSelectionTimeoutError

from server.app import app
from server.routes import analysis_router
from server.repositories import resume_analysis_repository as repository
from server.utils.jwt_utils import create_access_token


def run(coro):
    return asyncio.run(coro)


def test_bucket_boundaries_and_empty_periods():
    now = datetime(2026, 3, 1, 12, 20, tzinfo=timezone.utc)
    assert len(repository.period_starts("hourly", now)) == 24
    assert repository.period_starts("weekly", now)[-1].weekday() == 0
    months = repository.period_starts("monthly", now)
    assert months[-1] == datetime(2026, 3, 1, tzinfo=timezone.utc)
    assert months[-2] == datetime(2026, 2, 1, tzinfo=timezone.utc)
    from bson import ObjectId
    serialized = repository.serialize({"_id": ObjectId("507f1f77bcf86cd799439011"),
                                       "created_at": datetime(2026, 3, 1, 12)})
    assert serialized["created_at"].tzinfo == timezone.utc


def test_partial_case_insensitive_search_is_owned():
    query = repository.search_query("user-a", "ADa")
    assert query["user_id"] == "user-a"
    assert query["candidate_grams"] == "ada"
    assert query["candidate_name_normalized"]["$regex"] == "ada"
    assert "ana" in repository.name_grams("Diana")


def test_statistics_fills_empty_buckets_and_scopes_aggregation(monkeypatch):
    class Cursor:
        async def to_list(self, length):
            return [{"summary": [{"total": 2, "today": 1, "last_24_hours": 1,
                                     "last_7_days": 2, "current_month": 2}],
                     "chart": [{"_id": datetime(2026, 3, 1), "count": 1}]}]
    class Collection:
        def aggregate(self, pipeline):
            assert pipeline[0]["$match"] == {"user_id": "user-a", "status": "completed"}
            return Cursor()
    monkeypatch.setattr(repository, "collection", Collection())
    result = run(repository.statistics("user-a", "daily", datetime(2026, 3, 1, 12, tzinfo=timezone.utc)))
    assert len(result["buckets"]) == 30
    assert result["buckets"][-1]["count"] == 1
    assert result["buckets"][-2]["count"] == 0
    assert result["summary"]["total"] == 2


def test_list_page_paginates_without_resume_details(monkeypatch):
    from bson import ObjectId
    class Cursor:
        def sort(self, key, direction):
            assert key == "created_at" and direction == -1
            return self
        def skip(self, amount):
            assert amount == 10
            return self
        def limit(self, amount):
            assert amount == 10
            return self
        def __aiter__(self):
            async def rows():
                yield {"_id": ObjectId("507f1f77bcf86cd799439011"), "candidate_name": "Ada"}
            return rows()
    class Collection:
        async def count_documents(self, query):
            assert query["user_id"] == "user-a"
            assert query["candidate_grams"] == "ada"
            return 11
        def find(self, query, projection):
            assert projection["extracted_data"] == 0
            assert projection["requirements"] == 0
            return Cursor()
    monkeypatch.setattr(repository, "collection", Collection())
    result = run(repository.list_page("user-a", 2, 10, "Ada"))
    assert result["total"] == 11
    assert result["items"][0]["id"] == "507f1f77bcf86cd799439011"


def test_matching_details_preserve_legacy_numbers():
    from server.schemas.resume_schemas.job_requirements import JobRequirements
    from server.services.resume_services.compare_data.compare_data import compareDataWithRequirements
    requirements = JobRequirements(required_skills=["python", "sql"], required_tools=["Docker"],
        degree_requirements=["BS"], experience_requirements=[{"title": "Engineer", "years": 2}])
    data = {"skills": ["python"], "tools": ["docker"], "education": [{"degree": "BS Computer Science"}],
            "experience": [{"title": "Engineer", "years": 3}]}
    legacy = compareDataWithRequirements(data, requirements)
    detailed = compareDataWithRequirements(data, requirements, include_details=True)
    assert all(detailed[key] == value for key, value in legacy.items())
    assert detailed["matched_tools"] == ["Docker"]
    assert detailed["missing_skills"] == ["sql"]
    assert detailed["overall_percentage"] is None


def test_api_ownership_persistence_and_failure(monkeypatch):
    records = {}
    async def user_by_email(email):
        return {"_id": "user-a" if email == "a@example.com" else "user-b", "email": email}
    monkeypatch.setattr(analysis_router.UserService, "get_user_by_email", user_by_email)

    class FakeProvider:
        model = "test-model"
    class FakeService:
        resume_parser = type("Parser", (), {"provider": FakeProvider()})()
        async def process_resume(self, file, requirements, include_details=False):
            assert include_details
            return {"extracted_data": {"name": "Ada Lovelace", "email": None, "phone": None,
                    "skills": ["python"], "tools": [], "education": [], "experience": []},
                    "compare_result": {"skill_match": 1, "percentage_skill_match": 100,
                    "degree_match": False, "experience_match": 0, "percentage_experience_match": 0,
                    "overall_percentage": None}}
    monkeypatch.setattr(analysis_router, "CoreResumeService", FakeService)

    async def get_by_key(user_id, key):
        return next((value for value in records.values() if value["user_id"] == user_id and value.get("idempotency_key") == key), None)
    async def create(document):
        value = {**document, "id": "507f1f77bcf86cd799439011"}
        records[value["id"]] = value
        return value
    async def get_by_id(user_id, analysis_id):
        value = records.get(analysis_id)
        return value if value and value["user_id"] == user_id else None
    monkeypatch.setattr(repository, "get_by_key", get_by_key)
    monkeypatch.setattr(repository, "create", create)
    monkeypatch.setattr(repository, "get_by_id", get_by_id)

    async def scenario():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {"required_skills": '["python"]', "required_tools": "[]",
                       "degree_requirements": '["BS"]', "experience_requirements": '[{"title":"Engineer","years":2}]'}
            files = {"file": ("resume.pdf", b"%PDF-fake", "application/pdf")}
            route = "/api/resume-analyses"
            assert (await client.get(route)).status_code == 401
            a = {"Authorization": f"Bearer {create_access_token({'sub': 'a@example.com'})}", "Idempotency-Key": "request-1"}
            b = {"Authorization": f"Bearer {create_access_token({'sub': 'b@example.com'})}"}
            assert (await client.post(route, data=payload, files=files, headers=b)).status_code == 422
            response = await client.post(route, data=payload, files=files, headers=a)
            assert response.status_code == 201, response.text
            result = response.json()
            assert result["requirements"]["required_skills"] == ["python"]
            assert result["compare_result"]["percentage_skill_match"] == 100
            assert len(records) == 1
            repeated = await client.post(route, data=payload, files=files, headers=a)
            assert repeated.json()["id"] == result["id"] and len(records) == 1
            assert (await client.get(f"{route}/{result['id']}", headers=b)).status_code == 404
            assert (await client.get(f"{route}/{result['id']}", headers=a)).status_code == 200
            assert (await client.get(f"{route}/invalid", headers=a)).status_code == 422
            async def failed_create(document):
                raise ServerSelectionTimeoutError("database down")
            monkeypatch.setattr(repository, "create", failed_create)
            failed = await client.post(route, data=payload, files=files, headers={**a, "Idempotency-Key": "request-2"})
            assert failed.status_code == 503
    run(scenario())
