from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed, env-driven settings (AI_DESIGN.md, Architecture.md §9.2)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    port: int = 8000

    db_host: str = "localhost"
    db_port: int = 5432
    db_username: str = "tenderiq"
    db_password: str = "tenderiq_local"
    db_name: str = "tenderiq"

    redis_url: str = "redis://localhost:6379"

    llm_provider: str = "anthropic"
    anthropic_api_key: str = ""
    embedding_provider: str = "voyageai"
    voyage_api_key: str = ""

    internal_service_token: str = "change-me"


settings = Settings()
