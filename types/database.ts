export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          sku: string | null
          price: number
          compare_price: number | null
          pack_quantity: number
          stock: number
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_variants']['Insert']>
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          variant_id: string | null
          url: string
          alt: string | null
          sort_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_images']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          email: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          name: string
          line1: string
          line2: string | null
          city: string
          state: string
          pincode: string
          phone: string
          is_default: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['addresses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['addresses']['Insert']>
      }
      carts: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['carts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['carts']['Insert']>
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          variant_id: string
          quantity: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cart_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['cart_items']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          customer_name: string
          customer_email: string
          customer_phone: string
          shipping_address: Json
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_method: 'razorpay' | 'cod'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal: number
          discount: number
          shipping: number
          total: number
          notes: string | null
          tracking_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          variant_id: string | null
          variant_name: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      payments: {
        Row: {
          id: string
          order_id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          amount: number
          status: 'pending' | 'paid' | 'failed'
          method: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      business_enquiries: {
        Row: {
          id: string
          company_name: string
          contact_person: string
          email: string
          phone: string
          business_type: string
          quantity: string
          location: string
          requirements: string | null
          status: 'new' | 'contacted' | 'quoted' | 'closed'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['business_enquiries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['business_enquiries']['Insert']>
      }
      testimonials: {
        Row: {
          id: string
          name: string
          role: string | null
          content: string
          rating: number
          is_active: boolean
          is_demo: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['testimonials']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['testimonials']['Insert']>
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['faqs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['faqs']['Insert']>
      }
      site_settings: {
        Row: {
          key: string
          value: string
          updated_at: string
        }
        Insert: { key: string; value: string }
        Update: { value?: string }
      }
      coupons: {
        Row: {
          id: string
          code: string
          type: 'percent' | 'fixed'
          value: number
          min_order: number
          max_uses: number | null
          used_count: number
          is_active: boolean
          expires_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'created_at' | 'used_count'>
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience types
export type Product = Database['public']['Tables']['products']['Row']
export type ProductVariant = Database['public']['Tables']['product_variants']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Address = Database['public']['Tables']['addresses']['Row']
export type Cart = Database['public']['Tables']['carts']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type BusinessEnquiry = Database['public']['Tables']['business_enquiries']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type FAQ = Database['public']['Tables']['faqs']['Row']
export type SiteSetting = Database['public']['Tables']['site_settings']['Row']
export type Coupon = Database['public']['Tables']['coupons']['Row']

// Extended types with joins
export type ProductVariantWithProduct = ProductVariant & {
  product: Product
  images: ProductImage[]
}

export type CartItemWithVariant = CartItem & {
  variant: ProductVariant & {
    product: Product
    images: ProductImage[]
  }
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & { variant: ProductVariant & { product: Product } })[]
  payments: Payment[]
}
