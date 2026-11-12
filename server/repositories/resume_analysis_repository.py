import re
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from pymongo import ASCENDING, DESCENDING

from server.database import db


collection = db["resume_analyses"]


async def ensure_indexes():
    await collection.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    await collection.create_index([("user_id", ASCENDING), ("status", ASCENDING), ("created_at", DESCENDING)])
    await collection.create_index([("user_id", ASCENDING), ("candidate_grams", ASCENDING)])
    await collection.create_index([("user_id", ASCENDING), ("idempotency_key", ASCENDING)], unique=True,
                                  partialFilterExpression={"idempotency_key": {"$type": "string"}})


def name_grams(name):
    value = name.casefold().strip()
    return sorted({value[i:i+n] for n in (1, 2, 3) for i in range(max(len(value)-n+1, 0))})


def serialize(document):
    if document is None:
        return None
    result = {k: v for k, v in document.items() if k not in ("candidate_grams", "candidate_name_normalized", "idempotency_key")}
    result["id"] = str(result.pop("_id"))
    if result.get("created_at") and result["created_at"].tzinfo is None:
        result["created_at"] = result["created_at"].replace(tzinfo=timezone.utc)
    return result


async def create(document):
    result = await collection.insert_one(document)
    return await get_by_id(document["user_id"], str(result.inserted_id))


async def get_by_id(user_id, analysis_id):
    return serialize(await collection.find_one({"_id": ObjectId(analysis_id), "user_id": user_id}))


async def get_by_key(user_id, key):
    return serialize(await collection.find_one({"user_id": user_id, "idempotency_key": key}))


def search_query(user_id, search="", date_from=None, date_to=None):
    query = {"user_id": user_id}
    if search.strip():
        term = search.casefold().strip()
        query["candidate_name_normalized"] = {"$regex": re.escape(term)}
        query["candidate_grams"] = term[:3] if len(term) >= 3 else term
    if date_from or date_to:
        query["created_at"] = {}
        if date_from:
            query["created_at"]["$gte"] = date_from
        if date_to:
            query["created_at"]["$lt"] = date_to
    return query


async def list_page(user_id, page, page_size, search="", date_from=None, date_to=None):
    query = search_query(user_id, search, date_from, date_to)
    total = await collection.count_documents(query)
    projection = {"user_id": 0, "extracted_data": 0, "requirements": 0,
                  "candidate_grams": 0, "candidate_name_normalized": 0, "idempotency_key": 0}
    cursor = collection.find(query, projection).sort("created_at", DESCENDING).skip((page-1)*page_size).limit(page_size)
    return {"items": [serialize(row) async for row in cursor], "total": total, "page": page, "page_size": page_size}


def period_starts(period, now):
    hour = now.replace(minute=0, second=0, microsecond=0)
    day = hour.replace(hour=0)
    if period == "hourly":
        return [hour - timedelta(hours=i) for i in range(23, -1, -1)]
    if period == "daily":
        return [day - timedelta(days=i) for i in range(29, -1, -1)]
    if period == "weekly":
        week = day - timedelta(days=day.weekday())
        return [week - timedelta(weeks=i) for i in range(11, -1, -1)]
    month_index = now.year * 12 + now.month - 1
    return [datetime((month_index-i)//12, (month_index-i)%12+1, 1, tzinfo=timezone.utc)
            for i in range(11, -1, -1)]


async def statistics(user_id, period, now=None):
    now = now or datetime.now(timezone.utc)
    starts = period_starts(period, now)
    day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    month = day.replace(day=1)
    week_start = starts[0]
    unit = {"hourly": "hour", "daily": "day", "weekly": "week", "monthly": "month"}[period]
    # A single MongoDB aggregation supplies summary counters and chart buckets.
    pipeline = [
        {"$match": {"user_id": user_id, "status": "completed"}},
        {"$facet": {
            "summary": [{"$group": {"_id": None, "total": {"$sum": 1},
                "today": {"$sum": {"$cond": [{"$gte": ["$created_at", day]}, 1, 0]}},
                "last_24_hours": {"$sum": {"$cond": [{"$gte": ["$created_at", now-timedelta(hours=24)]}, 1, 0]}},
                "last_7_days": {"$sum": {"$cond": [{"$gte": ["$created_at", now-timedelta(days=7)]}, 1, 0]}},
                "current_month": {"$sum": {"$cond": [{"$gte": ["$created_at", month]}, 1, 0]}}}}],
            "chart": [{"$match": {"created_at": {"$gte": week_start}}},
                      {"$group": {"_id": {"$dateTrunc": {"date": "$created_at", "unit": unit,
                          "timezone": "UTC", **({"startOfWeek": "monday"} if period == "weekly" else {})}},
                          "count": {"$sum": 1}}}]
        }}]
    data = (await collection.aggregate(pipeline).to_list(length=1))[0]
    summary = data["summary"][0] if data["summary"] else {}
    counts = {row["_id"].replace(tzinfo=timezone.utc): row["count"] for row in data["chart"]}
    return {"timezone": "UTC", "period": period,
            "summary": {key: summary.get(key, 0) for key in ("total", "today", "last_24_hours", "last_7_days", "current_month")},
            "buckets": [{"start": start, "count": counts.get(start, 0)} for start in starts]}
