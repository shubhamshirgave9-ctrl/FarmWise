from typing import Dict
import re
import dateparser


CATEGORIES = {
    "fertilizer": {"fertilizer", "urea", "dap", "npk"},
    "seeds": {"seed", "seeds"},
    "labor": {"labor", "wages"},
    "fuel": {"fuel", "diesel", "petrol"},
}


def normalize_category(text: str) -> str:
    t = text.lower()
    for cat, keys in CATEGORIES.items():
        if any(k in t for k in keys):
            return cat
    return "misc"


def parse_amount(text: str) -> float:
    m = re.search(r"(?:(?:rs|inr|\$)\s*)?(\d+(?:[.,]\d{1,2})?)", text, re.I)
    if not m:
        return 0.0
    try:
        return float(m.group(1).replace(",", ""))
    except Exception:
        return 0.0


def parse_date(text: str):
    d = dateparser.parse(text)
    return d.date() if d else None


def extract_expense(text: str) -> Dict:
    amount = parse_amount(text)
    category = normalize_category(text)
    date_val = parse_date(text)
    crop = None
    # naive crop extraction: last word before category keyword
    for cat in CATEGORIES.keys():
        idx = text.lower().find(cat)
        if idx > 0:
            left = text[:idx].strip()
            tokens = re.findall(r"[A-Za-z]+", left)
            if tokens:
                crop = tokens[-1]
            break
    return {
        "crop_name": crop or "General",
        "category": category,
        "amount": amount,
        "date": str(date_val) if date_val else None,
        "note": text,
    }
