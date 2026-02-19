import { z } from 'zod'

/**
 * Validation schemas for backend API routes
 * Uses Zod for runtime type checking and sanitization
 */

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
    .optional()
    .or(z.literal('')),
  referralCode: z.string()
    .regex(/^[A-Z0-9_]+-[A-Z0-9]{4}$/i, 'Invalid referral code format')
    .optional()
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required')
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim()
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
})

export const otpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits').optional()
})

// ============================================
// TOURNAMENT SCHEMAS
// ============================================

export const createTournamentSchema = z.object({
  game: z.string().min(1, 'Game is required').max(50).trim(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200).trim(),
  description: z.string().max(5000, 'Description too long').optional(),
  image: z.string().url('Invalid image URL').max(500),
  entryFee: z.number().min(0, 'Entry fee must be positive').max(100000),
  prizePool: z.number().min(0, 'Prize pool must be positive').max(10000000),
  maxPlayers: z.number().int().min(2, 'Minimum 2 players').max(1000, 'Maximum 1000 players'),
  minPlayers: z.number().int().min(2, 'Minimum 2 players').max(1000).optional(),
  mode: z.enum(['SOLO', 'DUO', 'SQUAD']),
  startTime: z.string().datetime().or(z.date()),
  endTime: z.string().datetime().or(z.date()).optional().nullable(),
  rules: z.any().optional(),
  prizeDistribution: z.any().optional(),
  status: z.enum(['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED']).optional(),
  roomId: z.string().max(100).optional().nullable(),
  roomPassword: z.string().max(100).optional().nullable()
}).refine(data => {
  if (data.minPlayers && data.minPlayers > data.maxPlayers) {
    return false
  }
  return true
}, {
  message: 'Minimum players cannot exceed maximum players',
  path: ['minPlayers']
})

export const updateTournamentSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  description: z.string().max(5000).optional(),
  image: z.string().url().max(500).optional(),
  entryFee: z.number().min(0).max(100000).optional(),
  prizePool: z.number().min(0).max(10000000).optional(),
  maxPlayers: z.number().int().min(2).max(1000).optional(),
  minPlayers: z.number().int().min(2).max(1000).optional(),
  mode: z.enum(['SOLO', 'DUO', 'SQUAD']).optional(),
  startTime: z.string().datetime().or(z.date()).optional(),
  endTime: z.string().datetime().or(z.date()).optional().nullable(),
  rules: z.any().optional(),
  prizeDistribution: z.any().optional()
})

export const roomDetailsSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required').max(100).trim(),
  roomPassword: z.string().max(100).trim().optional()
})

export const tournamentStatusSchema = z.object({
  status: z.enum(['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'])
})

export const submitResultsSchema = z.object({
  results: z.array(z.object({
    userId: z.string().cuid(),
    rank: z.number().int().min(1).max(1000),
    kills: z.number().int().min(0).optional(),
    points: z.number().int().min(0).optional()
  })).min(1, 'At least one result is required').max(1000)
})

// ============================================
// USER SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).trim().optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional()
})

export const kycSchema = z.object({
  documents: z.object({
    idType: z.enum(['AADHAAR', 'PAN', 'DRIVING_LICENSE', 'PASSPORT']),
    idNumber: z.string().min(5).max(50).trim(),
    frontImage: z.string().url().max(500),
    backImage: z.string().url().max(500).optional(),
    selfieImage: z.string().url().max(500)
  })
})

export const gameProfileSchema = z.object({
  gameName: z.string().min(1).max(50).trim(),
  inGameId: z.string().min(1).max(100).trim(),
  inGameUsername: z.string().min(1).max(100).trim()
})

export const withdrawalSchema = z.object({
  amount: z.number().min(100, 'Minimum withdrawal is ₹100').max(100000, 'Maximum withdrawal is ₹100,000')
})

// ============================================
// ADMIN SCHEMAS
// ============================================

export const fineSchema = z.object({
  userId: z.string().cuid(),
  amount: z.number().min(1).max(100000),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000),
  evidence: z.string().url().max(500).optional(),
  tournamentId: z.string().cuid().optional()
})

export const disputeReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNotes: z.string().min(10).max(1000).trim()
})

export const createCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase().trim().regex(/^[A-Z0-9]+$/, 'Code must be alphanumeric'),
  type: z.enum(['FIRST_TIME', 'PROMOTIONAL', 'REFERRAL', 'SPECIAL_EVENT']),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().min(1).max(100000),
  scope: z.enum(['PLATFORM_WIDE', 'GAME_SPECIFIC', 'TOURNAMENT_SPECIFIC']),
  gameType: z.string().max(50).optional(),
  tournamentId: z.string().cuid().optional(),
  minAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  validFrom: z.string().datetime().or(z.date()).optional(),
  validUntil: z.string().datetime().or(z.date())
})

export const notificationSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  message: z.string().min(10).max(1000).trim(),
  targetType: z.enum(['ALL_USERS', 'GAME_SPECIFIC', 'ACTIVE_USERS', 'INACTIVE_USERS', 'WALLET_BASED', 'TOURNAMENT_PARTICIPANTS', 'CUSTOM']),
  targetFilter: z.any().optional(),
  recipientId: z.string().cuid().optional()
})

export const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  kycVerified: z.boolean().optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'SUPPORT', 'MARKETING']).optional()
})

export const disputeSubmissionSchema = z.object({
  justification: z.string().min(10, 'Justification must be at least 10 characters').max(2000).trim(),
  evidence: z.string().url().max(500).optional()
})

export const updateRegistrationSchema = z.object({
  verifiedInRoom: z.boolean().optional(),
  status: z.enum(['REGISTERED', 'PLAYING', 'COMPLETED', 'DISQUALIFIED']).optional(),
  inGameId: z.string().max(100).trim().optional(),
  inGameUsername: z.string().max(100).trim().optional()
})

export const disqualifyParticipantSchema = z.object({
  reason: z.string().min(10).max(500).trim().optional(),
  refund: z.boolean().optional()
})

// ============================================
// PAYMENT SCHEMAS
// ============================================

export const createOrderSchema = z.object({
  amount: z.number().min(1, 'Minimum amount is ₹1').max(100000, 'Maximum amount is ₹100,000')
})

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1)
})

export const applyCouponSchema = z.object({
  couponCode: z.string().min(1).max(20).toUpperCase().trim()
})

// ============================================
// QUERY PARAMS SCHEMAS
// ============================================

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0)
})

export const tournamentFiltersSchema = z.object({
  game: z.string().optional(),
  status: z.enum(['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED']).optional(),
  mode: z.enum(['SOLO', 'DUO', 'SQUAD']).optional()
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate and parse request body with Zod schema
 */
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
  try {
    const parsed = await schema.parseAsync(data)
    return { success: true, data: parsed }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

/**
 * Format Zod validation errors for API response
 */
export function formatValidationErrors(errors: z.ZodError<any>): string {
  return errors.issues.map((err: z.ZodIssue) => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
    return `${path}${err.message}`
  }).join(', ')
}
