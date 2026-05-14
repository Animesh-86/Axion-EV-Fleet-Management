-- Align users table columns with JPA User entity (id, username, passwordHash, role, createdAt, lastLogin)
ALTER TABLE users RENAME COLUMN user_id TO id;
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(255);
ALTER TABLE users RENAME COLUMN password TO password_hash;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
