from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings


def _to_asyncpg_url(url: str) -> str:
    # Railway / most providers hand out `postgres://` or `postgresql://`;
    # SQLAlchemy's async engine needs the `+asyncpg` driver marker.
    if url.startswith("postgres://"):
        return "postgresql+asyncpg://" + url[len("postgres://") :]
    if url.startswith("postgresql://"):
        return "postgresql+asyncpg://" + url[len("postgresql://") :]
    return url


class Base(DeclarativeBase):
    pass


settings = get_settings()
engine = create_async_engine(_to_asyncpg_url(settings.database_url), pool_pre_ping=True)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
