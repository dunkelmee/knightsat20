from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AuditLog


def record_action(
    db: AsyncSession, description: str, *, actor_name: str, actor_user_id: str | None = None
) -> None:
    """Queues an audit-log row — caller's existing `await db.commit()` persists it, so the log
    entry lands atomically with whatever change it describes."""
    db.add(AuditLog(description=description, actor_name=actor_name, actor_user_id=actor_user_id))
