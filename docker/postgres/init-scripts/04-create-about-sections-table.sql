-- Create about_sections table for the About page content
-- Each section has a title, paragraphs, an image, and display ordering

CREATE TABLE IF NOT EXISTS about_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    paragraphs JSONB NOT NULL DEFAULT '[]'::jsonb,
    image VARCHAR(500) NOT NULL,
    image_alt VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_about_sections_sort_order ON about_sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_about_sections_is_published ON about_sections(is_published);

-- Add trigger to update updated_at automatically
DROP TRIGGER IF EXISTS update_about_sections_updated_at ON about_sections;
CREATE TRIGGER update_about_sections_updated_at
    BEFORE UPDATE ON about_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE about_sections IS 'Sections for the About page, managed from the backoffice';
COMMENT ON COLUMN about_sections.paragraphs IS 'JSONB array of paragraph strings';
COMMENT ON COLUMN about_sections.sort_order IS 'Display order (ascending)';
COMMENT ON COLUMN about_sections.is_published IS 'Whether the section is visible on the public site';

-- Log table creation
DO $$
BEGIN
    RAISE NOTICE 'About sections table created successfully';
END $$;
