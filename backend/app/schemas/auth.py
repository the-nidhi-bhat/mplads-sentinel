"""
Pydantic schemas for authentication requests and responses.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., description="User ID or Email address")
    password: str = Field(..., description="Plain-text password")


class RegisterRequest(BaseModel):
    username: str = Field(..., description="Unique User ID or Email address")
    password: str = Field(..., min_length=4, description="Password (at least 4 characters)")
    name: str = Field(default="User", description="Display name / Full name")
    role: str = Field(default="Auditor", description="User role (Auditor, Administrator, Monitoring Officer)")


class UserResponse(BaseModel):
    name: str
    username: str
    email: str = ""
    role: str = "Auditor"


class AuthResponse(BaseModel):
    token: str
    user: UserResponse
