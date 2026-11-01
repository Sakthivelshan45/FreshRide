import { z } from 'zod'

export const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  addressLine1: z.string().min(5, 'Please enter your full address'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'Please enter your city'),
  state: z.string().min(2, 'Please select your state'),
  pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit PIN code'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['razorpay', 'cod']),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

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
