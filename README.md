# Product Management App with Shopify Integration

A modern product management application built with Next.js, Supabase, and Shopify API integration.

## Features

### 🛍️ **Product Management**
- Create, read, update, and delete products
- Hierarchical product structure (Grandparent → Parent → Child)
- Product categories and inventory tracking
- SKU and EAN13 management
- Price management in cents for precision

### 🔗 **Shopify Integration**
- Connect multiple Shopify stores
- Sync products between local database and Shopify
- Real-time inventory synchronization
- Product creation and updates in Shopify
- Connection testing and status monitoring

### 🔐 **Authentication**
- Secure login with Supabase Auth
- Protected dashboard routes
- User session management

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Shopify Integration**: shopify-api-node
- **Form Handling**: React Hook Form with Zod validation

## Setup Instructions

### Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Supabase account** and project
4. **Shopify store** with API access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd produu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the contents of `supabase-setup.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Shopify Integration Setup

### Getting Shopify API Credentials

1. **Access your Shopify Admin Panel**
   - Go to your Shopify store admin
   - Navigate to **Apps** → **App and sales channel development**

2. **Create a new app**
   - Click **Create an app**
   - Give your app a name (e.g., "Product Management Integration")
   - Click **Create app**

3. **Configure API access**
   - Go to **API credentials**
   - Under **Admin API access scopes**, add the following permissions:
     - `read_products`, `write_products`
     - `read_inventory`, `write_inventory`
     - `read_orders` (optional, for future features)
   - Click **Save**

4. **Generate access token**
   - Click **Install app**
   - Copy the **Admin API access token** (starts with `shpat_`)
   - Note your **Shopify domain** (e.g., `your-store.myshopify.com`)

### Connecting Your Store

1. **Access the Shopify Integration page**
   - Log into your product management app
   - Navigate to **Shopify Integration** in the sidebar

2. **Add your store**
   - Fill in the store details:
     - **Store Name**: A friendly name for your store
     - **Shopify Domain**: Your store's domain (e.g., `your-store.myshopify.com`)
     - **Access Token**: The API token you generated
   - Click **Store verbinden**

3. **Test the connection**
   - Use the **Verbindung testen** button to verify your credentials
   - If successful, you'll see a green checkmark

### Syncing Products

1. **Manual Sync**
   - Click **Produkte synchronisieren** on any connected store
   - This will sync all local products to Shopify

2. **Sync Process**
   - Products are matched by SKU
   - Existing products are updated
   - New products are created
   - Inventory levels are synchronized

## Database Schema

### Products Table
```sql
CREATE TABLE products (
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
```

### Shopify Stores Table
```sql
CREATE TABLE shopify_stores (
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
```

### Shopify Products Table
```sql
CREATE TABLE shopify_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  local_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  shopify_product_id BIGINT NOT NULL,
  shopify_variant_id BIGINT,
  shopify_store_id UUID REFERENCES shopify_stores(id) ON DELETE CASCADE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending'
);
```

## API Endpoints

### Shopify Actions
- `createShopifyStore()` - Add a new Shopify store connection
- `updateShopifyStore()` - Update store settings
- `deleteShopifyStore()` - Remove a store connection
- `testShopifyConnection()` - Test API connectivity
- `syncProductsToShopify()` - Sync products to Shopify
- `getShopifyProducts()` - Fetch products from Shopify
- `getShopInfo()` - Get store information

## Features in Detail

### Product Hierarchy
- **Grandparent**: Top-level products (e.g., "iPhone 15")
- **Parent**: Mid-level products (e.g., "iPhone 15 Pro")
- **Child**: Specific variants (e.g., "iPhone 15 Pro 128GB Blue")

### Shopify Sync Features
- **Bidirectional sync**: Local ↔ Shopify
- **SKU matching**: Products are matched by SKU
- **Inventory tracking**: Stock levels are synchronized
- **Price management**: Prices are converted between cents and dollars
- **Error handling**: Failed syncs are logged and reported

### Security Features
- **Row Level Security (RLS)** enabled on all tables
- **Authenticated users only** can access data
- **Secure token storage** in database
- **Connection testing** before saving credentials

## Troubleshooting

### Common Issues

1. **"Verbindung fehlgeschlagen"**
   - Check your Shopify domain format (should be `store.myshopify.com`)
   - Verify your access token is correct and has proper permissions
   - Ensure your Shopify store is active

2. **"Sync completed with errors"**
   - Check product SKUs for duplicates
   - Verify product data is valid
   - Check Shopify API rate limits

3. **"Store nicht gefunden"**
   - Refresh the page
   - Check if the store was deleted
   - Verify database connection

### Debug Mode
Enable debug logging by adding to your `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```

## Future Enhancements

- [ ] **Webhook support** for real-time updates
- [ ] **Bulk import/export** functionality
- [ ] **Order synchronization** from Shopify
- [ ] **Customer management** integration
- [ ] **Analytics dashboard** with sales data
- [ ] **Automated sync scheduling**
- [ ] **Multi-language support**
- [ ] **Advanced product variants** (size, color, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
