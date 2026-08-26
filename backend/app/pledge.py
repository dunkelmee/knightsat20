"""Port of src/utils/pledgeParser.ts — kept behavior-identical so the server-side
recomputed computedPledgeAmount matches what the frontend previews to the user."""

import re

_K_SHORTHAND = re.compile(r"([\d,.]+)\s*k\b", re.IGNORECASE)
_CURRENCY_PREFIX = re.compile(r"[₱p]\s*h?\s*p?", re.IGNORECASE)
_NON_NUMERIC = re.compile(r"[^0-9.]")


def parse_raw_amount_string(text: str | None) -> int:
    if not text or not text.strip():
        return 0

    cleaned = text.lower().strip()

    k_match = _K_SHORTHAND.search(cleaned)
    if k_match:
        try:
            val = float(k_match.group(1).replace(",", ""))
        except ValueError:
            val = float("nan")
        if val == val:  # not NaN
            return round(val * 1000)

    numbers_only = _CURRENCY_PREFIX.sub("", cleaned)
    numbers_only = numbers_only.replace(",", "")
    numbers_only = _NON_NUMERIC.sub(" ", numbers_only).strip()

    parts = [p for p in numbers_only.split() if p]
    if parts:
        try:
            parsed = float(parts[0])
        except ValueError:
            parsed = 0
        if parsed > 0:
            return round(parsed)

    return 0


def parse_pledge_amount(pledge_option: str, custom_pledge_amount: str | None = None) -> int:
    if pledge_option in (
        "I’m not able to contribute financially at this time",
        "None",
    ):
        return 0

    if pledge_option == "₱2,000":
        return 2000
    if pledge_option == "₱3,000":
        return 3000
    if pledge_option == "₱5,000":
        return 5000
    if pledge_option == "₱10,000+":
        if custom_pledge_amount and custom_pledge_amount.strip():
            parsed = parse_raw_amount_string(custom_pledge_amount)
            if parsed >= 10000:
                return parsed
        return 10000

    if pledge_option in ("Other", "Custom Amount"):
        return parse_raw_amount_string(custom_pledge_amount or "")

    return parse_raw_amount_string(custom_pledge_amount or pledge_option)
