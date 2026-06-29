"""Priority routing engine for incident ticket classification."""

import re

CRITICAL_KEYWORDS = [
    # Task 3 minimum keywords
    r"system\s+down",
    r"security\s+down",
    r"error\s*500",
    r"500\s+error",
    r"http\s*500",
    # Server and infrastructure failures
    r"server\s+down",
    r"server\s+crash",
    r"server\s+unavailable",
    r"service\s+unavailable",
    r"services\s+down",
    r"production\s+down",
    # Database failures
    r"database\s+down",
    r"database\s+failure",
    r"db\s+down",
    # Network failures
    r"network\s+down",
    r"network\s+failure",
    r"network\s+issue",
    r"connection\s+timeout",
    r"gateway\s+timeout",
    r"request\s+timeout",
    # API and application failures
    r"api\s+failure",
    r"api\s+down",
    r"application\s+crash",
    r"application\s+down",
    # Security incidents
    r"data\s+breach",
    r"unauthori[sz]ed\s+access",
    r"authentication\s+failed",
    r"auth\s+failure",
    r"denial\s+of\s+service",
    r"ddos",
    r"ransomware",
    # General critical / outage patterns
    r"outage",
    r"critical\s+failure",
    r"complete\s+outage",
]


def _normalize_description(description: str) -> str:
    """Normalize description text before keyword matching.

    Args:
        description: Raw incident description text.

    Returns:
        Trimmed description with collapsed internal whitespace.
    """
    if not description:
        return ""
    return re.sub(r"\s+", " ", str(description).strip())


def assign_priority(description: str) -> str:
    """Assign ticket priority based on critical keyword patterns in the description.

    Scans the normalized description against CRITICAL_KEYWORDS using
    case-insensitive regex matching. Returns "Critical" if any pattern
    matches, otherwise "Low".

    Args:
        description: Incident description text to evaluate.

    Returns:
        "Critical" if a critical keyword pattern is found, otherwise "Low".
    """
    text = _normalize_description(description)
    if not text:
        return "Low"

    for pattern in CRITICAL_KEYWORDS:
        if re.search(pattern, text, re.IGNORECASE):
            return "Critical"
    return "Low"
