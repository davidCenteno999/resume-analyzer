# ResumeAnalyzer

ResumeAnalyzer extracts structured information from an uploaded PDF resume, compares it with job requirements, and saves each analysis to the authenticated user's history. The React dashboard displays UTC activity statistics, searchable history, and persisted result details.

## Backend setup

Requires Python 3.10 or newer and MongoDB for user registration and login.

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
cp .env.example .env
```

Create an API key in the [Anthropic Console](https://platform.claude.com/settings/keys), add credits to the account if needed, and set `ANTHROPIC_API_KEY` in `.env`. Set the MongoDB connection and `JWT_SECRET_KEY` there as well. The `.env` file is ignored by Git.

```bash
.venv/bin/uvicorn server.app:app --reload
```

Interactive API documentation is available at `/docs`. The legacy `POST /resume/upload-resume` contract remains available. The dashboard uses authenticated `POST /api/resume-analyses`, which accepts a PDF and JSON-encoded `required_skills`, optional `required_tools`, `degree_requirements`, and `experience_requirements` form fields. Send a required `Idempotency-Key` header to make retries safe. Resume text is limited to 30,000 characters. No provider fallback is performed.

`GET /api/resume-analyses` supports `page`, `page_size`, case-insensitive partial `search`, `date_from`, and `date_to` (timezone-aware, exclusive upper bound). `GET /api/resume-analyses/{id}` returns stored details. `GET /api/resume-analyses/statistics?period=hourly|daily|weekly|monthly` returns UTC summary counts and zero-filled buckets. Weeks begin Monday. All history routes use the JWT bearer token and enforce ownership from the authenticated account. The `resume_analyses` collection stores user ID, candidate name and search grams, original filename, UTC creation time, requirements, extracted structured data, calculated results, status, optional provider/model/duration, and optional idempotency key. It does not store the PDF or raw extracted text. There is no overall score because the existing matcher has no cross-category scoring rule; see [ANALYSIS_CONTRACT.md](ANALYSIS_CONTRACT.md).

## Frontend

```bash
cd client
npm install
npm run dev
```

Set `VITE_API_BASE_URL` to the backend URL in `client/.env` if the default frontend setup does not already provide it. The dashboard lives at `/dashboard` after login.

## LLM selection

Set `LLM_PROVIDER` to `anthropic`, `github_models`, `openai`, or `gemini`. When omitted, `github_models` remains the default. Only the selected provider's API key is required. Set `ANTHROPIC_MODEL` to change the model without changing code; it defaults to `claude-haiku-4-5`. `ANTHROPIC_MAX_OUTPUT_TOKENS` defaults to 2048. Anthropic uses the official async Messages API with structured Pydantic output, a 30-second timeout, and at most one SDK retry for transient failures. Token counts are logged without resume contents.

## Correcting existing saved analyses

New analyses use case-insensitive, Unicode and whitespace-normalized exact matching for skills and tools. Existing saved results are not changed automatically. Preview a recalculation, then explicitly apply it to one user or all users:

```bash
.venv/bin/python -m server.scripts.recalculate_matching --user-id USER_ID
.venv/bin/python -m server.scripts.recalculate_matching --apply --user-id USER_ID
# Or, after reviewing a dry run across all users:
.venv/bin/python -m server.scripts.recalculate_matching --apply --all-users
```

The command uses the stored requirements and extraction only; it does not call an LLM or alter ownership, timestamps, PDFs, original labels, education, experience, or overall scores. It updates only skill and tool comparison fields, skips invalid records, and is idempotent.

## Tests

```bash
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python -m pytest -q
cd client && npm run lint && npm run build
```
