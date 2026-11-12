"""Explicit, dry-run-first correction of saved deterministic matching results.

Usage: python -m server.scripts.recalculate_matching [--user-id ID]
       python -m server.scripts.recalculate_matching --apply --user-id ID
       python -m server.scripts.recalculate_matching --apply --all-users
No PDF or LLM processing occurs. Existing requirements, extraction, IDs, and dates stay intact.
"""

import argparse
import asyncio
import json

from pydantic import ValidationError

from server.database import db
from server.schemas.resume_schemas.job_requirements import JobRequirements
from server.schemas.resume_schemas.resume_target_schema import ResumeStructured
from server.services.resume_services.compare_data.compare_data import (
    compareDataWithRequirements,
    matching_data_for_comparison,
)

CORRECTED_FIELDS = (
    "skill_match", "percentage_skill_match", "matched_skills", "missing_skills", "evaluated_skills",
    "matched_tools", "missing_tools", "evaluated_tools", "percentage_tool_match",
)


async def recalculate(collection, user_id=None, apply=False):
    query = {"user_id": user_id} if user_id else {}
    projection = {"user_id": 1, "requirements": 1, "extracted_data": 1, "compare_result": 1}
    counts = {"scanned": 0, "changed": 0, "updated": 0, "skipped": 0}
    async for document in collection.find(query, projection):
        counts["scanned"] += 1
        try:
            requirements = JobRequirements.model_validate(document["requirements"])
            extracted = ResumeStructured.model_validate(document["extracted_data"]).model_dump(exclude_unset=True)
            old_result = document["compare_result"]
            corrected = compareDataWithRequirements(
                matching_data_for_comparison(extracted), requirements, include_details=True
            )
        except (KeyError, TypeError, ValueError, ValidationError):
            counts["skipped"] += 1
            continue
        updated_result = {**old_result, **{key: corrected[key] for key in CORRECTED_FIELDS}}
        if updated_result == old_result:
            continue
        counts["changed"] += 1
        if apply:
            result = await collection.update_one(
                {"_id": document["_id"], "user_id": document["user_id"], "compare_result": old_result},
                {"$set": {"compare_result": updated_result}},
            )
            counts["updated"] += result.modified_count
    return counts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Write corrected comparison fields")
    scope = parser.add_mutually_exclusive_group()
    scope.add_argument("--user-id", help="Limit to one stored user ID")
    scope.add_argument("--all-users", action="store_true", help="Explicitly select all users")
    args = parser.parse_args()
    if args.apply and not (args.user_id or args.all_users):
        parser.error("--apply requires --user-id or --all-users")
    counts = asyncio.run(recalculate(db["resume_analyses"], args.user_id, args.apply))
    print(json.dumps({"mode": "apply" if args.apply else "dry-run", **counts}))


if __name__ == "__main__":
    main()
