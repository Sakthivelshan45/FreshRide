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
# Paste supabase/migrations/001_initial.sql into your Supabase SQL Editor

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

Run `supabase/migrations/001_initial.sql` in your Supabase SQL Editor.

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
