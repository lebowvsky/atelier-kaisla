-- Create contact_links table for social media and contact links
-- Each link has a platform type, URL, label, and display ordering

CREATE TYPE contact_links_platform_enum AS ENUM (
    'email', 'facebook', 'instagram', 'tiktok', 'linkedin',
    'pinterest', 'youtube', 'twitter', 'website', 'other'
);

CREATE TABLE IF NOT EXISTS contact_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform contact_links_platform_enum NOT NULL,
    url VARCHAR(500) NOT NULL,
    label VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_contact_links_platform_url UNIQUE (platform, url)
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_contact_links_is_active_sort_order ON contact_links(is_active, sort_order);

-- Add trigger to update updated_at automatically
DROP TRIGGER IF EXISTS update_contact_links_updated_at ON contact_links;
CREATE TRIGGER update_contact_links_updated_at
    BEFORE UPDATE ON contact_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE contact_links IS 'Social media and contact links, managed from the backoffice';
COMMENT ON COLUMN contact_links.platform IS 'Platform type (email, instagram, etc.)';
COMMENT ON COLUMN contact_links.sort_order IS 'Display order (ascending)';
COMMENT ON COLUMN contact_links.is_active IS 'Whether the link is visible on the public site';

-- Log table creation
DO $$
BEGIN
    RAISE NOTICE 'Contact links table created successfully';
END $$;
