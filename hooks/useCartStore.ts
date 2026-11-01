import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartProduct {
  variantId: string
  productId: string
  name: string
  variantName: string
  price: number
  comparePrice: number | null
  quantity: number
  image: string
  packQuantity: number
  stock: number
}

interface CartState {
  items: CartProduct[]
  couponCode: string | null
  couponDiscount: number
  addItem: (item: Omit<CartProduct, 'quantity'>) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  applyCoupon: (code: string, discount: number) => void
  removeCoupon: () => void
  getSubtotal: () => number
  getDiscount: () => number
  getShipping: () => number
  getTotal: () => number
  getItemCount: () => number
}

const FREE_SHIPPING_THRESHOLD = 999

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(i.quantity + 1, item.stock) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }))
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),

      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getDiscount: () => {
        const { couponDiscount } = get()
        return couponDiscount
      },

      getShipping: () => {
        const subtotal = get().getSubtotal()
        const discount = get().getDiscount()
        const afterDiscount = subtotal - discount
        return afterDiscount >= FREE_SHIPPING_THRESHOLD || get().items.length === 0 ? 0 : 99
      },

      getTotal: () => {
        return get().getSubtotal() - get().getDiscount() + get().getShipping()
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'butterfly-cart',
      partialize: (state) => ({ items: state.items, couponCode: state.couponCode, couponDiscount: state.couponDiscount }),
    }
  )
)
