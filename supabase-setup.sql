-- Erstelle die products Tabelle
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  ean13 TEXT CHECK (LENGTH(ean13) = 13 OR ean13 IS NULL),
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  category TEXT NOT NULL
);

-- Erstelle einen Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Aktiviere Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Erstelle eine Policy für authentifizierte Benutzer
CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Optional: Füge einige Beispieldaten hinzu
INSERT INTO products (name, sku, ean13, description, price, stock, category) VALUES
  ('iPhone 15 Pro', 'IPH15PRO-128', '1234567890123', 'Apple iPhone 15 Pro 128GB', 119900, 25, 'Smartphones'),
  ('Samsung Galaxy S24', 'SAMS24-256', '2345678901234', 'Samsung Galaxy S24 256GB', 99900, 18, 'Smartphones'),
  ('MacBook Air M2', 'MBA-M2-512', '3456789012345', 'Apple MacBook Air mit M2 Chip 512GB', 149900, 12, 'Laptops'),
  ('Dell XPS 13', 'DELLXPS13-512', '4567890123456', 'Dell XPS 13 512GB SSD', 129900, 8, 'Laptops'),
  ('Sony WH-1000XM5', 'SONYWH5', '5678901234567', 'Sony WH-1000XM5 Noise Cancelling Headphones', 39900, 30, 'Audio')
ON CONFLICT (sku) DO NOTHING; 