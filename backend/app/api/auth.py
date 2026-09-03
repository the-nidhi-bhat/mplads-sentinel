"""
Authentication API - username / password login scanning credentials file (users.json).
"""

from __future__ import annotations

import base64
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, status

from backend.app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])

USERS_FILE = Path(__file__).resolve().parent.parent.parent / "users.json"

DEFAULT_USERS = [
    {
        "username": "ravi_kishan",
        "password": "ravi_kishan123",
        "name": "Ravi Kishan",
        "role": "Auditor",
        "email": "ravi_kishan@mplads.gov.in",
    },
    {
        "username": "admin",
        "password": "password123",
        "name": "System Administrator",
        "role": "Administrator",
        "email": "admin@mplads.gov.in",
    },
]


def _load_users() -> list[dict[str, Any]]:
    """Scan and read credentials from users.json file."""
    if USERS_FILE.exists():
        try:
            with open(USERS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except Exception as err:
            print(f"[auth] Error reading users.json: {err}")
    
    # Auto-create default users.json if missing
    try:
        USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(DEFAULT_USERS, f, indent=2)
    except Exception:
        pass
    return DEFAULT_USERS


def _save_user(user: dict[str, Any]) -> None:
    """Persist user record into users.json file."""
    users = _load_users()
    existing_index = next(
        (i for i, u in enumerate(users) if u.get("username", "").lower() == user["username"].lower()),
        None,
    )
    if existing_index is not None:
        users[existing_index] = user
    else:
        users.append(user)
        
    try:
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2)
    except Exception as err:
        print(f"[auth] Error saving to users.json: {err}")


def _find_user(identifier: str) -> dict[str, Any] | None:
    target = identifier.lower().strip()
    users = _load_users()
    for u in users:
        u_name = str(u.get("username", "")).lower().strip()
        u_email = str(u.get("email", "")).lower().strip()
        if u_name == target or u_email == target:
            return u
    return None


def _create_token(username: str, role: str) -> str:
    """Return a structured JWT-like token for prototype sessions."""
    header = "eyJhbGciOiJIUzI1NiJ9"  # {"alg":"HS256"}
    expires = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
    payload = f"{username}|{role}|{expires}"
    payload_b64 = base64.urlsafe_b64encode(payload.encode()).decode().rstrip("=")
    signature = "mplads-prototype-sig"
    return f"{header}.{payload_b64}.{signature}"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/login", response_model=AuthResponse)
@router.post("/sign-in", response_model=AuthResponse)
def login(body: LoginRequest) -> AuthResponse:
    """Authenticate by scanning users.json credentials file."""
    target_user = body.username.lower().strip()
    user = _find_user(target_user)

    if not user or user.get("password") != body.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    uname = user.get("username", target_user)
    name = user.get("name", uname.capitalize())
    email = user.get("email", f"{uname}@mplads.gov.in")
    role = user.get("role", "Auditor")

    return AuthResponse(
        token=_create_token(uname, role),
        user=UserResponse(
            name=name,
            username=uname,
            email=email,
            role=role,
        ),
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@router.post("/sign-up", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest) -> AuthResponse:
    """Register user and persist to users.json file."""
    uname = body.username.lower().strip()

    if _find_user(uname):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with that Username or Email already exists.",
        )

    new_user = {
        "username": uname,
        "password": body.password,
        "name": body.name.strip() or uname.capitalize(),
        "email": uname if "@" in uname else f"{uname}@mplads.gov.in",
        "role": body.role or "Auditor",
    }
    _save_user(new_user)

    return AuthResponse(
        token=_create_token(uname, new_user["role"]),
        user=UserResponse(
            name=new_user["name"],
            username=uname,
            email=new_user["email"],
            role=new_user["role"],
        ),
    )


@router.get("/me", response_model=UserResponse)
def get_current_user(username: str) -> UserResponse:
    """Return profile for given username/email by checking users.json."""
    user = _find_user(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserResponse(
        name=user.get("name", user.get("username", username)),
        username=user.get("username", username),
        email=user.get("email", f"{username}@mplads.gov.in"),
        role=user.get("role", "Auditor"),
    )
