import { prisma } from './prisma'
import { sendEmail } from './email'
import { sendSMS } from './sms'

// Generate random coupon code
export function generateCouponCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Default prize distribution percentages
export const DEFAULT_PRIZE_DISTRIBUTION = {
  TOP_3: {
    1: 50,  // 50%
    2: 30,  // 30%
    3: 20,  // 20%
  },
  TOP_5: {
    1: 40,  // 40%
    2: 25,  // 25%
    3: 15,  // 15%
    4: 12,  // 12%
    5: 8,   // 8%
  },
  TOP_10: {
    1: 30,
    2: 20,
    3: 15,
    4: 10,
    5: 8,
    6: 6,
    7: 5,
    8: 3,
    9: 2,
    10: 1,
  },
}

// Calculate prize for a rank
export function calculatePrize(
  rank: number,
  prizePool: number,
  distribution: Record<number, number>
): number {
  const percentage = distribution[rank] || 0
  return (prizePool * percentage) / 100
}

// Log admin activity
export async function logAdminActivity(
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: any,
  ipAddress?: string
) {
  await prisma.adminActivity.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
    },
  })
}

// Check admin permissions
export function hasPermission(role: string, action: string): boolean {
  const permissions: Record<string, string[]> = {
    SUPER_ADMIN: ['*'], // All permissions
    TOURNAMENT_MANAGER: ['tournaments:*', 'results:*'],
    SUPPORT: ['users:view', 'fines:*', 'disputes:*', 'kyc:*'],
    MARKETING: ['notifications:*', 'coupons:*'],
  }

  const userPermissions = permissions[role] || []
  
  if (userPermissions.includes('*')) return true
  if (userPermissions.includes(action)) return true
  
  // Check wildcard permissions (e.g., "tournaments:*")
  const [resource] = action.split(':')
  return userPermissions.some(p => p === `${resource}:*`)
}

// Get users based on notification target
export async function getUsersForNotification(
  targetType: string,
  filter?: any
) {
  const where: any = { isActive: true }

  switch (targetType) {
    case 'ALL_USERS':
      break
    
    case 'GAME_SPECIFIC':
      if (filter?.game) {
        where.gameProfiles = {
          some: { gameName: filter.game }
        }
      }
      break
    
    case 'ACTIVE_USERS':
      const activeDays = filter?.days || 7
      where.lastActive = {
        gte: new Date(Date.now() - activeDays * 24 * 60 * 60 * 1000)
      }
      break
    
    case 'INACTIVE_USERS':
      const inactiveDays = filter?.days || 30
      where.lastActive = {
        lt: new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000)
      }
      break
    
    case 'WALLET_BASED':
      if (filter?.min !== undefined) where.walletBalance = { gte: filter.min }
      if (filter?.max !== undefined) where.walletBalance = { ...where.walletBalance, lte: filter.max }
      break
    
    case 'TOURNAMENT_PARTICIPANTS':
      if (filter?.tournamentId) {
        where.registrations = {
          some: { tournamentId: filter.tournamentId }
        }
      }
      break
    
    case 'CUSTOM':
      if (filter?.userIds) {
        where.id = { in: filter.userIds }
      }
      break
  }

  return await prisma.user.findMany({
    where,
    select: { id: true, email: true, phone: true, username: true }
  })
}

// Check if room details should be visible (15-30 min before start)
export function canViewRoomDetails(startTime: Date): boolean {
  const now = new Date()
  const diffMs = startTime.getTime() - now.getTime()
  const diffMinutes = diffMs / (1000 * 60)
  
  return diffMinutes <= 30 && diffMinutes >= 0
}

// Send notification via email/SMS
export async function sendNotification(
  recipient: { email?: string; phone?: string },
  title: string,
  message: string
) {
  try {
    if (recipient.email) {
      await sendEmail(recipient.email, title, message)
    }
    
    if (recipient.phone) {
      await sendSMS(recipient.phone, message)
    }
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
}
