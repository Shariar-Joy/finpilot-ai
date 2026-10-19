"""Private, stateless analytics service. It never receives credentials or merchant text."""
import calendar
import hmac
import os
from datetime import date
from typing import Annotated, Literal

from fastapi import FastAPI, Header, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field, StrictInt, field_validator

app = FastAPI(title="FinPilot deterministic analytics", version="1.0.0", docs_url=None, redoc_url=None)


class Transaction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(min_length=1, max_length=80)
    date: date
    category: Literal["Income", "Dining", "Groceries", "Housing", "Transport", "Subscriptions", "Utilities", "Shopping", "Health", "Other"]
    amount: Annotated[StrictInt, Field(ge=-100_000_000, le=100_000_000)]


class AnalysisRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    month: str = Field(pattern=r"^20\d{2}-(0[1-9]|1[0-2])$")
    transactions: list[Transaction] = Field(max_length=10_000)

    @field_validator("transactions")
    @classmethod
    def unique_ids(cls, rows: list[Transaction]) -> list[Transaction]:
        if len({row.id for row in rows}) != len(rows):
            raise ValueError("Transaction IDs must be unique")
        return rows


@app.middleware("http")
async def bound_body(request: Request, call_next):
    from starlette.responses import JSONResponse
    # Enforce both declared and actual lengths, including chunked requests.
    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > 2 * 1024 * 1024:
            return JSONResponse({"detail": "Request too large"}, status_code=413)
    request._body = bytes(body)
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


@app.get("/health")
def health():
    return {"status": "ok", "service": "finpilot-analytics", "stateless": True}


@app.post("/analyze")
def analyze(body: AnalysisRequest, x_service_token: Annotated[str | None, Header()] = None):
    expected = os.environ.get("ANALYTICS_SERVICE_TOKEN", "")
    if not expected:
        raise HTTPException(503, "Service token is not configured")
    if not x_service_token or not hmac.compare_digest(x_service_token, expected):
        raise HTTPException(401, "Unauthorized service request")
    rows = [t for t in body.transactions if t.date.isoformat().startswith(body.month)]
    income = sum(t.amount for t in rows if t.amount > 0)
    expenses = -sum(t.amount for t in rows if t.amount < 0)
    year, month = map(int, body.month.split("-"))
    by_category = {}
    for row in rows:
        if row.amount < 0:
            by_category[row.category] = by_category.get(row.category, 0) - row.amount
    return {"month": body.month, "income": income, "expenses": expenses, "savings": income - expenses, "count": len(rows), "daysInMonth": calendar.monthrange(year, month)[1], "byCategory": by_category, "method": "Integer minor-unit arithmetic; UTC calendar month; no predictions or model calculations"}
