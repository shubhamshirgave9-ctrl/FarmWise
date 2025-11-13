from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


class RegisterRequest(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    language: str = "en"


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


class UserResponse(BaseModel):
    id: UUID
    name: str
    phone: str
    email: Optional[str] = None
    language: str

    class Config:
        from_attributes = True


class VerifyOTPResponse(BaseModel):
    status: str
    user: UserResponse
    access_token: str
    refresh_token: str


