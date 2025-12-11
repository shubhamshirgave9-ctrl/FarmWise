from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models.user import User
from app.schemas.auth_schemas import (
    RegisterRequest,
    RegisterResponse,
    RequestOTPRequest,
    RequestOTPResponse,
    VerifyOTPRequest,
    VerifyOTPResponse,
    UserResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
)
from app.utils.otp_handler import generate_otp, send_otp_via_twilio, store_otp, verify_otp
from app.utils.jwt_handler import create_access_token, create_refresh_token, verify_token
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user and send OTP"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.phone == request.phone).first()
    
    if existing_user and existing_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already registered"
        )
    
    # Create or update user (inactive)
    if existing_user:
        existing_user.name = request.name
        existing_user.email = request.email
        existing_user.language = request.language
        user = existing_user
    else:
        user = User(
            name=request.name,
            phone=request.phone,
            email=request.email,
            language=request.language,
            is_active=False
        )
        db.add(user)
    
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already exists"
        )
    
    # Generate and send OTP
    otp = generate_otp()
    store_otp(request.phone, otp)
    send_otp_via_twilio(request.phone, otp)
    
    return RegisterResponse(
        status="otp_sent",
        user_temp_id=f"tmp_{str(user.id)[:8]}",
        message="OTP sent successfully"
    )


@router.post("/request-otp", response_model=RequestOTPResponse)
async def request_otp(request: RequestOTPRequest):
    """Request OTP for login"""
    otp = generate_otp()
    store_otp(request.phone, otp)
    send_otp_via_twilio(request.phone, otp)
    
    return RequestOTPResponse(
        status="otp_sent",
        message="OTP sent successfully"
    )


@router.post("/verify-otp", response_model=VerifyOTPResponse)
async def verify_otp_endpoint(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify OTP and activate user"""
    # Verify OTP
    if not verify_otp(request.phone, request.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    # Get or create user
    user = db.query(User).filter(User.phone == request.phone).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register first."
        )
    
    # Activate user
    user.is_active = True
    db.commit()
    db.refresh(user)
    
    # Generate JWT tokens
    token_data = {"sub": str(user.id), "phone": user.phone}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)
    
    return VerifyOTPResponse(
        status="success",
        user=UserResponse.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_tokens(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """Refresh access token using refresh token"""
    payload = verify_token(request.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    token_data = {"sub": str(user.id), "phone": user.phone}
    new_access_token = create_access_token(data=token_data)
    new_refresh_token = create_refresh_token(data=token_data)

    return RefreshTokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token
    )

