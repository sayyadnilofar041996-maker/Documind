"""
DocuMind - schemas/common.py
Purpose : Shared Pydantic v2 schemas — pagination, RFC 7807 error, health
Phase   : 1
"""
from pydantic import BaseModel, ConfigDict, Field


class PaginationParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page: int = Field(1, ge=1, description="1-based page number")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")


class ErrorResponse(BaseModel):
    """RFC 7807 Problem Details for HTTP APIs."""

    model_config = ConfigDict(extra="ignore")

    type: str = Field(
        "about:blank",
        description="URI reference that identifies the problem type",
    )
    title: str = Field(..., description="Short, human-readable summary of the problem")
    status: int = Field(..., description="HTTP status code")
    detail: str = Field(..., description="Human-readable explanation specific to this occurrence")
    instance: str = Field(
        "about:blank",
        description="URI reference identifying the specific occurrence",
    )


class HealthResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: str
    version: str
    dependencies: dict[str, str] = Field(default_factory=dict)
