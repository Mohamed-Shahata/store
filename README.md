# Premium E-Commerce Store

A production-ready e-commerce web application built with Next.js, Supabase, and modern React tooling. Customers browse and order via WhatsApp — no account required. Store owners manage everything through a secure admin dashboard.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Supabase** — PostgreSQL, Auth, Storage
- **Tailwind CSS v4** + Shadcn/UI components
- **Zustand** — cart state (localStorage persistence)
- **React Hook Form** + **Zod** — form validation
- **Framer Motion** — animations
- **next-themes** — dark/light mode

## Features

### Customer Store
- Premium home page with hero, featured products, new arrivals, best sellers
- Product listing with search, category/price filters, sorting, pagination
- Product detail pages with image gallery and related products
- Shopping cart with localStorage persistence
- WhatsApp checkout (auto-generated order message)

### Admin Dashboard
- Secure login via Supabase Auth
- Dashboard overview with stats
- Product CRUD with multi-image upload
- Category management
- Discount management (percentage/fixed)
- Store settings (logo, social links, banners, SEO)

### SEO & Performance
- Dynamic metadata, Open Graph, Twitter Cards
- JSON-LD structured data for products
- Sitemap.xml and robots.txt
- Server Components, image optimization, lazy loading

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Create storage buckets if not auto-created: `product-images`, `store-assets`
4. Copy `.env.example` to `.env.local` and fill in your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Create an admin user

1. Go to Supabase Dashboard → Authentication → Users → Add user
2. Run in SQL Editor (replace UUID and email):

```sql
INSERT INTO admins (id, email)
VALUES ('YOUR_USER_UUID', 'admin@yourstore.com');
```

### 4. Run the dev server

```bash
npm run dev
```

- Store: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Project Structure

```
src/
├── app/
│   ├── (store)/          # Customer-facing pages
│   ├── admin/            # Admin dashboard
│   └── api/              # API routes
├── components/
│   ├── admin/            # Admin components
│   ├── layout/           # Navbar, footer
│   ├── store/            # Store components
│   └── ui/               # Shadcn UI primitives
├── lib/
│   ├── data/             # Data fetching
│   ├── supabase/         # Supabase clients
│   └── validations/      # Zod schemas
├── stores/               # Zustand stores
└── types/                # TypeScript types
supabase/
└── migrations/           # Database schema
```

## WhatsApp Checkout

Default WhatsApp number: `01152432513` (configurable in admin settings).

When a customer clicks **Order Now via WhatsApp**, the app:
1. Validates customer name and phone
2. Logs the order to Supabase
3. Opens WhatsApp with a pre-filled message
4. Redirects to `https://wa.me/201152432513?text=...`

## Internationalization (i18n)

The store supports **English** and **Arabic**:

- English: `http://localhost:3000/en`
- Arabic: `http://localhost:3000/ar` (RTL layout)

Use the language switcher in the navbar to switch languages. Translation files live in `messages/en.json` and `messages/ar.json`.

The admin dashboard remains in English.

## Deployment

Deploy to [Vercel](https://vercel.com) and set environment variables. Update `NEXT_PUBLIC_SITE_URL` to your production domain.

## License

MIT
