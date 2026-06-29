"""Priority routing engine for incident ticket classification."""

import re

# Typo-tolerant match for "critical" (e.g. critical, crictical, crtical)
_CRITICAL_WORD = r'cri(?:tic?al|ctical)'

CRITICAL_KEYWORDS = [
    # --- Core assignment phrases ---
    r"system[\s-]+down",
    r"systems?[\s-]+(?:is[\s-]+)?down",
    r"system[\s-]+(?:is[\s-]+)?(?:down|offline|unavailable)",
    r"sytem[\s-]+down",
    r"systen[\s-]+down",
    r"security[\s-]+down",
    r"security[\s-]+(?:is[\s-]+)?down",
    r"secur[i]?ty[\s-]+down",
    r"securty[\s-]+down",
    r"error\s*:?\s*500",
    r"error\s*500",
    r"500\s+error",
    r"http\s+500",
    r"server[\s-]+crash(?:ed)?",
    r"data[\s-]+breach",
    r"outage",
    r"outages",
    rf"{_CRITICAL_WORD}[\s-]+failure",
    rf"{_CRITICAL_WORD}[\s-]+failures",
    r"unauthori[sz]ed[\s-]+access",
    # --- Critical issue / system combinations (incl. common typos) ---
    rf"{_CRITICAL_WORD}[\s-]+issues?",
    rf"{_CRITICAL_WORD}[\s-]+issue[\s-]+in[\s-]+system",
    rf"{_CRITICAL_WORD}[\s-]+issues?[\s-]+in[\s-]+(?:the[\s-]+)?system",
    rf"{_CRITICAL_WORD}.*\bsystem\b",
    rf"\bsystem\b.*{_CRITICAL_WORD}",
    rf"{_CRITICAL_WORD}.*\bdown\b",
    rf"\bdown\b.*{_CRITICAL_WORD}",
]

# Descriptions that must stay Low even if a loose word appears
LOW_PRIORITY_OVERRIDES = [
    r"^minor\s+",
    r"^low\s+priority",
    r"cosmetic\s+only",
    r"spelling\s+mistake",
    r"label\s+alignment",
]


def _normalize_description(description: str | None) -> str:
    """Normalize description text before keyword matching.

    Args:
        description: Raw incident description, possibly None.

    Returns:
        Stripped description string, or empty string when missing.
    """
    if not description:
        return ""
    return str(description).strip()


def assign_priority(description: str | None) -> str:
    """Assign ticket priority based on critical keyword patterns in the description.

    Scans the description against CRITICAL_KEYWORDS using case-insensitive
    regex matching. Returns "Critical" if any pattern matches, otherwise "Low".

    Args:
        description: Incident description text to evaluate.

    Returns:
        "Critical" if a critical keyword pattern is found, otherwise "Low".
    """
    text = _normalize_description(description)
    if not text:
        return "Low"

    lowered = text.lower()
    for pattern in LOW_PRIORITY_OVERRIDES:
        if re.search(pattern, lowered, re.IGNORECASE):
            return "Low"

    for pattern in CRITICAL_KEYWORDS:
        if re.search(pattern, text, re.IGNORECASE):
            return "Critical"
    return "Low"
