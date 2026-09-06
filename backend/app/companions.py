"""Reading the survey's companion answers.

The adult-guest answer is stored twice: as a count (``plus_ones_count``) and as
a display string (``bringing_plus_one``: "No +1", "Yes, 1 +1", "Yes, 3
guests"). Anything asking "is this person bringing an adult guest?" has to lead
with the count — the string only equals the literal one-guest wording, so a
plain ``== "Yes, 1 +1"`` check silently reads False for two or more guests.
"""

from app.models import SurveyResponse


def has_plus_one(response: SurveyResponse) -> bool:
    if response.plus_ones_count is not None:
        return response.plus_ones_count > 0
    # Responses submitted before the count was persisted carry only the string.
    return bool(response.bringing_plus_one) and response.bringing_plus_one.startswith("Yes")


def plus_one_count(response: SurveyResponse) -> int:
    """How many adult guests the response is bringing, 0 when none."""
    if response.plus_ones_count is not None:
        return max(0, response.plus_ones_count)
    # Pre-count responses only say whether there was one, not how many.
    return 1 if has_plus_one(response) else 0
