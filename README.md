# Butterfly Fresh Ride 🦋

**Premium Disposable Travel Bedding Kit — E-Commerce Platform**

> *Your Comfort On The Go*

A complete, production-ready e-commerce website for Butterfly Fresh Ride disposable travel bedding kits. Built with Next.js 16 App Router, Supabase, Razorpay, Framer Motion, and React Three Fiber.

---

## Quick Start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase & Razorpay keys

# 3. Set up the database
# Run supabase/migrations/001_initial.sql through 005_harden_razorpay_orders.sql in order

# 4. Run dev server
npm run dev
# Opens at http://localhost:3001 (or 3000 if free)
```

---

## Environment Variables

Edit `.env.local`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_ID` | Same as above (server-side) |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Settings → Webhooks |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API (server-side only) |
| `NEXT_PUBLIC_SITE_URL` | Site origin (for example `http://localhost:3000` locally) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Razorpay (online + COD) |
| Styling | Vanilla CSS (custom design system) |
| Animations | Framer Motion |
| 3D Hero | React Three Fiber + Three.js |
| State | Zustand (cart persistence) |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Fonts | Google Fonts (Inter + Playfair Display) |

---

## Pages

### Customer-Facing
| Route | Description |
|---|---|
| `/` | Homepage with all sections |
| `/shop` | Product listing with sort |
| `/product/fresh-ride-kit` | Product detail with gallery & variant selector |
| `/cart` | Cart with coupon support |
| `/checkout` | Checkout with Razorpay & COD |
| `/order-success` | Successful payment confirmation |
| `/order-failed` | Failed or dismissed payment |
| `/orders/[id]` | Order confirmation |
| `/account` | Account dashboard |
| `/account/login` | Login |
| `/account/register` | Registration |
| `/account/orders` | Order history |
| `/business` | B2B wholesale page |
| `/contact` | Contact page |

### Admin
| Route | Description |
|---|---|
| `/admin` | Dashboard |
| `/admin/products` | Product management |
| `/admin/orders` | Order management |
| `/admin/enquiries` | B2B enquiry inbox |

---

## Database Setup

For a new database, run migrations `001_initial.sql` through
`005_harden_razorpay_orders.sql` in order in the Supabase SQL Editor. For an
existing database that has already applied migration 004, apply migration 005.
The Razorpay order routes use the service-role key for writes; browser clients
can read only their own orders and order items.

### Razorpay Webhook

Configure the webhook URL as `https://<your-domain>/api/razorpay/webhook` and
subscribe to `payment.captured` and `payment.failed`. Set the webhook's secret
as `RAZORPAY_WEBHOOK_SECRET` in `.env.local` and Vercel.

### Make a User Admin

```sql
UPDATE profiles SET is_admin = true WHERE id = 'your-user-uuid';
```

---

## Brand Colors

| Token | Hex | Usage |
|---|---|---|
| Deep Forest Green | `#1A4731` | Primary, buttons |
| Sage Green | `#4A7C59` | Secondary text |
| Gold Accent | `#C8A96E` | Highlights, CTAs |
| Dark Navy | `#17232D` | Headlines |
| Light Background | `#F5F7F4` | Page background |

---

## Coupon Codes (Seed Data)

| Code | Type | Value | Min Order |
|---|---|---|---|
| `FRESH10` | Percent | 10% off | ₹500 |
| `WELCOME` | Fixed | ₹50 off | ₹300 |

---

*Built for Butterfly Groups.*
