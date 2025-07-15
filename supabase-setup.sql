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
  category TEXT NOT NULL,
  parent_id UUID REFERENCES products(id),
  sku_level TEXT CHECK (sku_level IN ('grandparent', 'parent', 'child')) DEFAULT 'child'
);

-- Erstelle die shopify_stores Tabelle für Shopify-Integration
CREATE TABLE IF NOT EXISTS shopify_stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  store_name TEXT NOT NULL,
  shopify_domain TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  api_key TEXT,
  api_secret TEXT,
  webhook_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'idle'
);

-- Erstelle die shopify_products Tabelle für Shopify-Produkt-Mapping
CREATE TABLE IF NOT EXISTS shopify_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  local_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  shopify_product_id BIGINT NOT NULL,
  shopify_variant_id BIGINT,
  shopify_store_id UUID REFERENCES shopify_stores(id) ON DELETE CASCADE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending'
);

-- Erstelle einen Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_parent_id ON products(parent_id);
CREATE INDEX IF NOT EXISTS idx_shopify_products_local_id ON shopify_products(local_product_id);
CREATE INDEX IF NOT EXISTS idx_shopify_products_shopify_id ON shopify_products(shopify_product_id);

-- Aktiviere Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_products ENABLE ROW LEVEL SECURITY;

-- Erstelle Policies für authentifizierte Benutzer
CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage shopify stores" ON shopify_stores
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage shopify products" ON shopify_products
  FOR ALL USING (auth.role() = 'authenticated');

-- Optional: Füge einige Beispieldaten hinzu
INSERT INTO products (name, sku, ean13, description, price, stock, category, sku_level) VALUES
  ('iPhone 15 Pro', 'IPH15PRO-128', '1234567890123', 'Apple iPhone 15 Pro 128GB', 119900, 25, 'Smartphones', 'grandparent'),
  ('Samsung Galaxy S24', 'SAMS24-256', '2345678901234', 'Samsung Galaxy S24 256GB', 99900, 18, 'Smartphones', 'grandparent'),
  ('MacBook Air M2', 'MBA-M2-512', '3456789012345', 'Apple MacBook Air mit M2 Chip 512GB', 149900, 12, 'Laptops', 'grandparent'),
  ('Dell XPS 13', 'DELLXPS13-512', '4567890123456', 'Dell XPS 13 512GB SSD', 129900, 8, 'Laptops', 'grandparent'),
  ('Sony WH-1000XM5', 'SONYWH5', '5678901234567', 'Sony WH-1000XM5 Noise Cancelling Headphones', 39900, 30, 'Audio', 'grandparent')
ON CONFLICT (sku) DO NOTHING; 