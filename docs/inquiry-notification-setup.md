# Inquiry Notification Setup

Route inquiry submissions are sent to:
1. Your email inbox (SMTP)
2. Your Telegram bot group

## Required env vars

Add these to your `.env.local`:

```bash
INQUIRY_SMTP_HOST=smtp.yourmail.com
INQUIRY_SMTP_PORT=587
INQUIRY_SMTP_USER=your_smtp_user
INQUIRY_SMTP_PASS=your_smtp_password
INQUIRY_EMAIL_FROM="DeepChinaTrip <no-reply@yourdomain.com>"
INQUIRY_EMAIL_TO=your_inbox@example.com

TELEGRAM_BOT_TOKEN=123456789:ABCDEF_your_bot_token
TELEGRAM_CHAT_ID=-1001234567890
```

## Telegram notes

1. Add your bot to the target group.
2. Promote bot or allow posting in the group.
3. Use group chat id format like `-100...`.

## Endpoint

The form posts to:

`POST /api/inquiry`

If either email or Telegram delivery fails, the API returns `500` and the UI shows a submit error.
