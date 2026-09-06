"""correct the misspelled 4th Year section name "Fermin" -> "Fermi"

The section columns are free-text, and the Directory filters them with an
exact `==` against the option list in src/utils/sections.ts. Fixing the typo
in that list alone would strand anyone who already saved "Fermin": they would
never match the "Fermi" filter, and the Edit Profile <select> would render
their section as blank (silently clearing it on the next save).

Revision ID: 0019
Revises: 0018
Create Date: 2026-09-06

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0019"
down_revision: Union[str, None] = "0018"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("UPDATE users SET section_hs = 'Fermi' WHERE section_hs = 'Fermin'")
    # Legacy free-text snapshot from the original survey form, still shown and
    # searched in the admin Survey Responses tab.
    op.execute(
        "UPDATE survey_responses SET section2007 = 'Fermi' "
        "WHERE section2007 = 'Fermin'"
    )


def downgrade() -> None:
    op.execute("UPDATE users SET section_hs = 'Fermin' WHERE section_hs = 'Fermi'")
    op.execute(
        "UPDATE survey_responses SET section2007 = 'Fermin' "
        "WHERE section2007 = 'Fermi'"
    )
