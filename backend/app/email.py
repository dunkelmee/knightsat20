import logging

import httpx

from app.config import get_settings

logger = logging.getLogger("knightsat.email")

RESEND_API_URL = "https://api.resend.com/emails"


def _otp_email_html(full_name: str, code: str) -> str:
    return f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <p>Hi {full_name.split(' ')[0] if full_name else 'there'},</p>
      <p>Your MSHS Batch 2007 Reunion Hub verification code is:</p>
      <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 24px 0;">{code}</p>
      <p>This code expires in 10 minutes. If you didn't request this, you can safely ignore it.</p>
    </div>
    """.strip()


async def send_otp_email(to_email: str, full_name: str, code: str) -> None:
    settings = get_settings()

    if not settings.resend_api_key:
        # No email provider configured yet — log the code so the auth flow is
        # still fully testable locally. Never do this in production: set
        # RESEND_API_KEY so codes actually reach the user's inbox instead of
        # the server log.
        logger.warning("RESEND_API_KEY not set — OTP for %s is: %s", to_email, code)
        return

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            RESEND_API_URL,
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json={
                "from": settings.resend_from_email,
                "to": [to_email],
                "subject": "Your MSHS Batch 2007 verification code",
                "html": _otp_email_html(full_name, code),
            },
        )
        if response.status_code >= 400:
            logger.error("Resend send failed (%s): %s", response.status_code, response.text)
            response.raise_for_status()
