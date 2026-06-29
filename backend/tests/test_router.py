"""Unit tests for the priority routing engine."""

import pytest

from router import assign_priority

CRITICAL_CASES = [
    ("system down in production", "Critical"),
    ("security down on firewall", "Critical"),
    ("users see error 500 on login", "Critical"),
    ("500 error on checkout page", "Critical"),
    ("http 500 from payment API", "Critical"),
    ("error500 on checkout page", "Critical"),
    ("server down in staging", "Critical"),
    ("server crash overnight", "Critical"),
    ("primary server unavailable for users", "Critical"),
    ("service unavailable on main portal", "Critical"),
    ("database failure during backup", "Critical"),
    ("database down in production cluster", "Critical"),
    ("network issue blocked all internal access", "Critical"),
    ("connection timeout on login service", "Critical"),
    ("api failure on authentication endpoint", "Critical"),
    ("application crash in billing module", "Critical"),
    ("data breach during audit", "Critical"),
    ("authentication failed for admin accounts", "Critical"),
    ("denial of service attack detected", "Critical"),
    ("major outage today", "Critical"),
    ("critical failure in auth", "Critical"),
    ("unauthorized access detected", "Critical"),
    ("unauthorised access detected", "Critical"),
    ("SYSTEM DOWN in prod", "Critical"),
    ("The   system    down   affected users", "Critical"),
]

REMAINING_CRITICAL_CASES = [
    ("services down in region east", "Critical"),
    ("production down overnight", "Critical"),
    ("db down on replica node", "Critical"),
    ("network down between sites", "Critical"),
    ("network failure on core switch", "Critical"),
    ("gateway timeout on checkout", "Critical"),
    ("request timeout on search API", "Critical"),
    ("api down for mobile clients", "Critical"),
    ("application down since midnight", "Critical"),
    ("auth failure on admin login", "Critical"),
    ("ddos attack on public endpoint", "Critical"),
    ("ransomware detected on file server", "Critical"),
    ("complete outage across all regions", "Critical"),
]

LOW_CASES = [
    ("minor UI glitch on settings page", "Low"),
    ("random text with no keywords", "Low"),
    ("slow page load on dashboard", "Low"),
    ("", "Low"),
    (None, "Low"),
]


@pytest.mark.parametrize("description,expected", REMAINING_CRITICAL_CASES)
def test_assign_priority_remaining_critical_keywords(description: str, expected: str) -> None:
    """Additional critical keyword patterns return Critical priority."""
    assert assign_priority(description) == expected


def test_assign_priority_non_string_description() -> None:
    """Non-string descriptions are normalized before keyword matching."""
    assert assign_priority(123) == "Low"


@pytest.mark.parametrize("description,expected", CRITICAL_CASES)
def test_assign_priority_critical_keywords(description: str, expected: str) -> None:
    """Descriptions with critical keywords return Critical priority."""
    assert assign_priority(description) == expected


@pytest.mark.parametrize("description,expected", LOW_CASES)
def test_assign_priority_low_keywords(description: str, expected: str) -> None:
    """Descriptions without critical keywords return Low priority."""
    assert assign_priority(description) == expected


def test_task3_minimum_keywords() -> None:
    """Task 3 minimum routing keywords assign Critical priority."""
    assert assign_priority("The system down affected users") == "Critical"
    assert assign_priority("We have a security down today") == "Critical"
    assert assign_priority("error 500 on payment gateway") == "Critical"
