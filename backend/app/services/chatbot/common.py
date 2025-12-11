from typing import Dict


def build_system_prompt(app_name: str) -> str:
    return f"You are an assistant for {app_name}. Provide concise, practical guidance for farmers."


def normalize_error(e: Exception) -> Dict:
    return {"error": str(e)}
