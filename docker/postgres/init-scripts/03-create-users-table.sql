-- Create users table for authentication
-- This table stores admin and editor users with hashed passwords

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Bcrypt hashed password
    role VARCHAR(20) NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on username for fast login queries
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add comment for documentation
COMMENT ON TABLE users IS 'User accounts for backoffice authentication';
COMMENT ON COLUMN users.password IS 'Bcrypt hashed password (salt rounds = 10)';
COMMENT ON COLUMN users.role IS 'User role: admin (full access) or editor (limited access)';
