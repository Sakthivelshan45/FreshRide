import { z } from 'zod'

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email address').max(254),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  addressLine1: z.string().trim().min(5, 'Please enter your full address').max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2, 'Please enter your city').max(100),
  state: z.string().trim().min(2, 'Please select your state').max(100),
  pincode: z.string().regex(/^[1-9]\d{5}$/, 'Please enter a valid 6-digit PIN code'),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(['razorpay', 'cod']),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

export const razorpayCreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        variant_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .min(1)
    .max(100)
    .superRefine((items, context) => {
      const variantIds = new Set<string>()
      for (const [index, item] of items.entries()) {
        if (variantIds.has(item.variant_id)) {
          context.addIssue({
            code: 'custom',
            message: 'A product variant may only appear once.',
            path: [index, 'variant_id'],
          })
        }
        variantIds.add(item.variant_id)
      }
    }),
  customer: checkoutSchema.omit({ paymentMethod: true }),
  couponCode: z.string().trim().min(1).max(50).optional(),
})

export const cashOnDeliveryOrderSchema = z.object({
  formData: checkoutSchema.extend({ paymentMethod: z.literal('cod') }),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .min(1)
    .max(100)
    .superRefine((items, context) => {
      const variantIds = new Set<string>()
      for (const [index, item] of items.entries()) {
        if (variantIds.has(item.variantId)) {
          context.addIssue({
            code: 'custom',
            message: 'A product variant may only appear once.',
            path: [index, 'variantId'],
          })
        }
        variantIds.add(item.variantId)
      }
    }),
  couponCode: z.string().trim().min(1).max(50).optional(),
})

export const razorpayVerifySchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string().min(1).max(100),
  razorpayPaymentId: z.string().min(1).max(100),
  razorpaySignature: z.string().regex(/^[a-f\d]{64}$/i),
})

export const adminProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  short_description: z.string().max(500),
  description: z.string().max(10000),
  category: z.string().max(100),
  feature_tags: z.array(z.string().trim().min(1).max(100)).max(50),
  is_active: z.boolean(),
  price: z.number().finite().min(0).max(99999999.99),
  compare_price: z.number().finite().min(0).max(99999999.99).nullable(),
  stock: z.number().int().min(0).max(2147483647),
  image_url: z.string().trim().max(2048).optional().default(''),
})

export const businessEnquirySchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  businessType: z.string().min(1, 'Please select your business type'),
  quantity: z.string().min(1, 'Please specify required quantity'),
  location: z.string().min(3, 'Please enter delivery location'),
  requirements: z.string().optional(),
})

export type BusinessEnquiryFormData = z.infer<typeof businessEnquirySchema>

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>
