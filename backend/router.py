"""Priority routing engine for incident ticket classification."""

import re

CRITICAL_KEYWORDS = [
    r"system\s+down",
    r"security\s+down",
    r"error\s*500",
    r"server\s+crash",
    r"data\s+breach",
    r"outage",
    r"critical\s+failure",
    r"unauthori[sz]ed\s+access",
]


def assign_priority(description: str) -> str:
    """Assign ticket priority based on critical keyword patterns in the description.

    Scans the description against CRITICAL_KEYWORDS using case-insensitive
    regex matching. Returns "Critical" if any pattern matches, otherwise "Low".

    Args:
        description: Incident description text to evaluate.

    Returns:
        "Critical" if a critical keyword pattern is found, otherwise "Low".
    """
    for pattern in CRITICAL_KEYWORDS:
        if re.search(pattern, description, re.IGNORECASE):
            return "Critical"
    return "Low"
