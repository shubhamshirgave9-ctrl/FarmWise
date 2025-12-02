from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_PATH = BASE_DIR / "agris.db"
ENV_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{DB_PATH}"
    JWT_SECRET_KEY: str = "supersecretkey"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None

    OTP_LENGTH: int = 6
    OTP_EXPIRE_MINUTES: int = 5

    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_MODEL: str = "meta-llama/llama-3.3-70b-instruct:free"
    OPENROUTER_HTTP_REFERER: Optional[str] = None
    OPENROUTER_TITLE: Optional[str] = None
    OPENROUTER_APP_NAME: str = "AgriSmart Chatbot"

    PLANTID_API_KEY: Optional[str] = None
    CHATBOT_IMAGE_UPLOAD_DIR: str = "uploads/images"

    class Config:
        env_file = str(ENV_PATH)
        case_sensitive = True


settings = Settings()
