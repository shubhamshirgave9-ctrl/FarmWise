from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class RegisterRequest(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    language: Optional[str] = Field(default="en")


class UserResponse(BaseModel):
    id: UUID
    name: str
    phone: str
    email: Optional[str] = None
    language: str
    is_active: bool

    class Config:
        from_attributes = True


class RegisterResponse(BaseModel):
    status: str
    user_temp_id: str
    message: str


class RequestOTPRequest(BaseModel):
    phone: str


class RequestOTPResponse(BaseModel):
    status: str
    message: str


class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str


class VerifyOTPResponse(BaseModel):
    status: str
    user: UserResponse
    access_token: str
    refresh_token: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
