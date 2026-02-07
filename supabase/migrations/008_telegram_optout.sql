-- Add telegram_notifications preference to persons (default true for existing users)
ALTER TABLE persons ADD COLUMN telegram_notifications BOOLEAN NOT NULL DEFAULT true;
