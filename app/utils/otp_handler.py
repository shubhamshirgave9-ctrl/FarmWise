import random
import string
from datetime import datetime, timedelta
from typing import Optional, Dict
from twilio.rest import Client
from app.config import settings

# In-memory OTP storage (in production, use Redis or database)
otp_storage: Dict[str, Dict[str, any]] = {}


def generate_otp(length: int = 6) -> str:
    """Generate random OTP"""
    return ''.join(random.choices(string.digits, k=length))


def send_otp_via_twilio(phone: str, otp: str) -> bool:
    """Send OTP via Twilio SMS"""
    try:
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            # In development, just log the OTP
            print(f"[DEV MODE] OTP for {phone}: {otp}")
            return True
        
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"Your AgriSmart OTP is: {otp}. Valid for {settings.OTP_EXPIRE_MINUTES} minutes.",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone
        )
        return message.sid is not None
    except Exception as e:
        print(f"Error sending OTP: {e}")
        return False


def store_otp(phone: str, otp: str) -> None:
    """Store OTP with expiration"""
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    otp_storage[phone] = {
        "otp": otp,
        "expires_at": expires_at,
        "attempts": 0
    }


def verify_otp(phone: str, otp: str) -> bool:
    """Verify OTP"""
    if phone not in otp_storage:
        return False
    
    stored_data = otp_storage[phone]
    
    # Check expiration
    if datetime.utcnow() > stored_data["expires_at"]:
        del otp_storage[phone]
        return False
    
    # Check attempts (max 5 attempts)
    if stored_data["attempts"] >= 5:
        del otp_storage[phone]
        return False
    
    stored_data["attempts"] += 1
    
    # Verify OTP
    if stored_data["otp"] == otp:
        del otp_storage[phone]
        return True
    
    return False


def clear_otp(phone: str) -> None:
    """Clear OTP from storage"""
    if phone in otp_storage:
        del otp_storage[phone]


