from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginResponse, UserResponse


class AuthError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


async def register_user(db: AsyncSession, email: str, password: str) -> UserResponse:
    email = email.lower().strip()
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        raise AuthError("AUTH_EMAIL_EXISTS", "Email already registered.", 409)

    user = User(email=email, password_hash=hash_password(password))
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


async def login_user(db: AsyncSession, email: str, password: str) -> LoginResponse:
    email = email.lower().strip()
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        raise AuthError("AUTH_INVALID_CREDENTIALS", "Invalid email or password.", 401)

    access_token = create_access_token({"sub": str(user.id)})
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


async def get_current_user_from_token(db: AsyncSession, token: str) -> User:
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise AuthError("AUTH_INVALID_TOKEN", "Invalid or expired token.", 401)

    try:
        user_id = UUID(payload["sub"])
    except ValueError as exc:
        raise AuthError("AUTH_INVALID_TOKEN", "Invalid token subject.", 401) from exc

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise AuthError("AUTH_INVALID_TOKEN", "User not found.", 401)

    return user
