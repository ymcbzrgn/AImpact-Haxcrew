from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Gemini AI
    gemini_api_key: str = ""

    # CORS
    backend_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"


settings = Settings()
