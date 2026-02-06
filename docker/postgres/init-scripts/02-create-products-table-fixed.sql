-- Drop existing table if it exists
DROP TABLE IF EXISTS products CASCADE;

-- Create ENUM types
DO $$ BEGIN
    CREATE TYPE product_category AS ENUM ('wall-hanging', 'rug');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('available', 'sold', 'draft');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create products table matching TypeORM entity
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  category product_category NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status product_status NOT NULL DEFAULT 'draft',
  "stockQuantity" INTEGER DEFAULT 0,
  images TEXT,
  dimensions JSON,
  materials TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes (matching TypeORM @Index decorators)
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category_status ON products(category, status);

-- Optional: Insert sample data for testing
INSERT INTO products (name, description, category, price, status, "stockQuantity", materials) VALUES
  ('Sunset Tapestry', 'Beautiful handwoven wall hanging with sunset colors', 'wall-hanging', 250.00, 'available', 3, 'Wool, Cotton'),
  ('Mountain Rug', 'Handcrafted rug with mountain landscape', 'rug', 450.00, 'available', 2, 'Wool, Jute');
