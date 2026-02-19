import { prisma } from './prisma'
import { logger } from './logger'

/**
 * Referral System
 * Implements user referrals with reward tracking
 */

export interface ReferralReward {
  referrerBonus: number  // Amount referrer gets
  refereeBonus: number   // Amount new user gets
  minDeposit?: number    // Minimum deposit required for reward
}

export const REFERRAL_CONFIG: ReferralReward = {
  referrerBonus: 50,     // ₹50 for referrer
  refereeBonus: 25,      // ₹25 for new user
  minDeposit: 100        // Reward triggered after first ₹100 deposit
}

/**
 * Generate unique referral code for user
 */
export function generateReferralCode(username: string, userId: string): string {
  // Format: USERNAME-XXXX (first 6 chars of username + last 4 chars of userId)
  const cleanUsername = username.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  const userIdSuffix = userId.slice(-4).toUpperCase()
  return `${cleanUsername}-${userIdSuffix}`
}

/**
 * Create or get user's referral code
 */
export async function getUserReferralCode(userId: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, id: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // For now, generate dynamically. In production, store in User model
    return generateReferralCode(user.username, user.id)
  } catch (error) {
    logger.error('Failed to get referral code', error as Error, { userId })
    throw error
  }
}

/**
 * Validate referral code and get referrer
 */
export async function validateReferralCode(referralCode: string): Promise<{
  valid: boolean
  referrerId?: string
  referrerUsername?: string
}> {
  try {
    // Extract userId from referral code (last 4 chars before hyphen)
    const parts = referralCode.split('-')
    if (parts.length !== 2) {
      return { valid: false }
    }

    const userIdSuffix = parts[1]

    // Find user with matching ID suffix
    const users = await prisma.user.findMany({
      where: {
        id: {
          endsWith: userIdSuffix
        }
      },
      select: {
        id: true,
        username: true
      }
    })

    if (users.length === 0) {
      return { valid: false }
    }

    // Verify the code matches
    for (const user of users) {
      const expectedCode = generateReferralCode(user.username, user.id)
      if (expectedCode === referralCode) {
        return {
          valid: true,
          referrerId: user.id,
          referrerUsername: user.username
        }
      }
    }

    return { valid: false }
  } catch (error) {
    logger.error('Failed to validate referral code', error as Error, { referralCode })
    return { valid: false }
  }
}

/**
 * Track referral during user registration
 * Store referrer ID in user metadata for now (or add referredBy field to User model)
 */
export async function trackReferral(newUserId: string, referralCode: string): Promise<boolean> {
  try {
    const validation = await validateReferralCode(referralCode)

    if (!validation.valid || !validation.referrerId) {
      return false
    }

    // Check referrer is not the same as new user
    if (validation.referrerId === newUserId) {
      logger.warn('User tried to refer themselves', { userId: newUserId })
      return false
    }

    // Store referral tracking
    // Note: In production, add referredBy field to User model
    // For now, we'll use transaction metadata
    await prisma.transaction.create({
      data: {
        userId: newUserId,
        type: 'DEPOSIT',
        amount: 0,
        status: 'PENDING',
        description: 'Referral tracking',
        metadata: {
          type: 'REFERRAL_TRACKING',
          referrerId: validation.referrerId,
          referralCode,
          rewardPending: true
        }
      }
    })

    logger.info('Referral tracked', {
      newUserId,
      referrerId: validation.referrerId,
      referralCode
    })

    return true
  } catch (error) {
    logger.error('Failed to track referral', error as Error, { newUserId, referralCode })
    return false
  }
}

/**
 * Process referral rewards after first deposit
 * Call this from deposit/payment webhook
 */
export async function processReferralRewards(userId: string, depositAmount: number): Promise<{
  processed: boolean
  referrerRewarded?: boolean
  refereeRewarded?: boolean
}> {
  try {
    // Check if deposit meets minimum requirement
    if (depositAmount < (REFERRAL_CONFIG.minDeposit || 0)) {
      return { processed: false }
    }

    // Find referral tracking transaction
    const referralTracking = await prisma.transaction.findFirst({
      where: {
        userId,
        type: 'DEPOSIT',
        description: 'Referral tracking',
        metadata: {
          path: ['type'],
          equals: 'REFERRAL_TRACKING'
        }
      }
    })

    if (!referralTracking) {
      return { processed: false }
    }

    const metadata = referralTracking.metadata as any
    if (!metadata.rewardPending) {
      return { processed: false } // Already processed
    }

    const referrerId = metadata.referrerId

    // Process rewards in transaction
    await prisma.$transaction(async (tx) => {
      // Reward referrer
      await tx.user.update({
        where: { id: referrerId },
        data: {
          walletBalance: {
            increment: REFERRAL_CONFIG.referrerBonus
          }
        }
      })

      await tx.transaction.create({
        data: {
          userId: referrerId,
          type: 'PROMOTIONAL_EXPENSE',
          amount: REFERRAL_CONFIG.referrerBonus,
          status: 'SUCCESS',
          description: 'Referral reward - Friend joined',
          metadata: {
            type: 'REFERRAL_REWARD',
            referredUserId: userId
          }
        }
      })

      // Reward new user (referee)
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            increment: REFERRAL_CONFIG.refereeBonus
          }
        }
      })

      await tx.transaction.create({
        data: {
          userId,
          type: 'PROMOTIONAL_EXPENSE',
          amount: REFERRAL_CONFIG.refereeBonus,
          status: 'SUCCESS',
          description: 'Welcome bonus - Referral reward',
          metadata: {
            type: 'REFERRAL_REWARD',
            referrerId
          }
        }
      })

      // Mark tracking as processed
      await tx.transaction.update({
        where: { id: referralTracking.id },
        data: {
          status: 'SUCCESS',
          metadata: {
            ...metadata,
            rewardPending: false,
            processedAt: new Date().toISOString()
          }
        }
      })
    })

    logger.info('Referral rewards processed', {
      userId,
      referrerId,
      referrerBonus: REFERRAL_CONFIG.referrerBonus,
      refereeBonus: REFERRAL_CONFIG.refereeBonus
    })

    return {
      processed: true,
      referrerRewarded: true,
      refereeRewarded: true
    }
  } catch (error) {
    logger.error('Failed to process referral rewards', error as Error, { userId })
    return { processed: false }
  }
}

/**
 * Get user's referral statistics
 */
export async function getUserReferralStats(userId: string): Promise<{
  referralCode: string
  totalReferrals: number
  totalEarned: number
  pendingRewards: number
}> {
  try {
    const referralCode = await getUserReferralCode(userId)

    // Count successful referrals
    const referralTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'PROMOTIONAL_EXPENSE',
        status: 'SUCCESS',
        description: {
          contains: 'Referral reward'
        }
      }
    })

    const totalReferrals = referralTransactions.length
    const totalEarned = referralTransactions.reduce((sum, t) => sum + Number(t.amount), 0)

    // Count pending referrals (users who signed up but haven't deposited yet)
    const pendingTracking = await prisma.transaction.count({
      where: {
        type: 'DEPOSIT',
        description: 'Referral tracking',
        status: 'PENDING',
        metadata: {
          path: ['referrerId'],
          equals: userId
        }
      }
    })

    return {
      referralCode,
      totalReferrals,
      totalEarned,
      pendingRewards: pendingTracking
    }
  } catch (error) {
    logger.error('Failed to get referral stats', error as Error, { userId })
    throw error
  }
}

/**
 * Create referral coupon for specific user
 * Can be used for personalized referral campaigns
 */
export async function createReferralCoupon(userId: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const referralCode = await getUserReferralCode(userId)

    // Create REFERRAL type coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: referralCode,
        type: 'REFERRAL',
        discountType: 'FIXED',
        discountValue: REFERRAL_CONFIG.refereeBonus,
        scope: 'PLATFORM_WIDE',
        usageLimit: 1, // One use per new user
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true
      }
    })

    logger.info('Referral coupon created', {
      userId,
      couponCode: coupon.code
    })

    return coupon.code
  } catch (error) {
    logger.error('Failed to create referral coupon', error as Error, { userId })
    throw error
  }
}
