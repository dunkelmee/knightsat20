from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://knightsat:knightsat@localhost:5432/knightsat"
    admin_password: str = "admin2007"
    session_secret: str = "dev-insecure-session-secret-change-me"
    environment: str = "development"
    static_dir: str = "static"

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
