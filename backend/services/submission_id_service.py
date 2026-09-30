"""Generates unique, year-scoped submission IDs in the format `pemnet-NNN-YYYY`."""

from datetime import datetime
from models import db, Submission, ExtractedAbstractData


def generate_submission_id() -> str:
    """
    Generate the next submission ID for the current year.

    Format: pemnet-<3-digit-sequence>-<4-digit-year>
    Example: pemnet-001-2026, pemnet-042-2026
    """
    current_year = datetime.now().year
    year_prefix = str(current_year)
    like_pattern = f'pemnet-%-{year_prefix}'

    existing_ids = Submission.query.filter(
        Submission.submission_id.like(like_pattern)
    ).with_entities(Submission.submission_id).all()

    extracted_ids = ExtractedAbstractData.query.filter(
        ExtractedAbstractData.submission_id.like(like_pattern)
    ).with_entities(ExtractedAbstractData.submission_id).all()

    all_ids = [row[0] for row in existing_ids if row[0]] + \
              [row[0] for row in extracted_ids if row[0]]

    max_number = 0
    for submission_id in all_ids:
        try:
            parts = submission_id.split('-')
            if len(parts) == 3:
                num = int(parts[1])
                max_number = max(max_number, num)
        except (ValueError, IndexError):
            continue

    return f"pemnet-{max_number + 1:03d}-{year_prefix}"