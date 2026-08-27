def initials(full_name: str) -> str:
    parts = full_name.strip().split()
    letters = "".join(part[0] for part in parts[:2] if part)
    return letters.upper() or "?"
