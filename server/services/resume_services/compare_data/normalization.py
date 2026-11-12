"""Exact comparison keys for skills, tools, and technology names."""

import unicodedata


def normalize_skill(value: object) -> str:
    """Return a stable key without erasing meaningful punctuation.

    Invalid or whitespace-only values have no comparison key.
    """
    if not isinstance(value, str):
        return ""
    return " ".join(unicodedata.normalize("NFKC", value).casefold().split())


def unique_display_values(values: object) -> list[str]:
    """Deduplicate by normalized key, retaining first original spelling and order."""
    if not isinstance(values, (list, tuple)):
        return []
    result = []
    seen = set()
    for value in values:
        key = normalize_skill(value)
        if key and key not in seen:
            result.append(value)
            seen.add(key)
    return result


def match_requirements(required: object, extracted: object) -> tuple[list[str], list[str], list[str]]:
    """Return unique requirements and their matched/missing original labels."""
    unique_required = unique_display_values(required)
    extracted_keys = {normalize_skill(value) for value in unique_display_values(extracted)}
    matched = [value for value in unique_required if normalize_skill(value) in extracted_keys]
    missing = [value for value in unique_required if normalize_skill(value) not in extracted_keys]
    return unique_required, matched, missing
