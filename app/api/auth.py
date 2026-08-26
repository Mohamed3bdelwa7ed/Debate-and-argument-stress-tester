from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserResponse
from app.services import auth_service
from app.services.auth_service import AuthError

router = APIRouter(prefix="/api/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> UserResponse:
    user = await auth_service.get_current_user_from_token(db, token)
    return UserResponse.model_validate(user)


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)) -> RegisterResponse:
    user = await auth_service.register_user(db, request.email, request.password)
    return RegisterResponse(user=user)


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login and receive JWT",
)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)) -> LoginResponse:
    return await auth_service.login_user(db, request.email, request.password)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
async def me(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return current_user
