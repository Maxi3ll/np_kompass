-- Remove Telegram notification feature (DSGVO: no third-party dependency)
ALTER TABLE persons DROP COLUMN IF EXISTS telegram_notifications;
