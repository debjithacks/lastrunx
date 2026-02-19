import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { processWithdrawalTransaction } from '@/lib/transaction-manager'
import { withdrawalSchema, validateRequest, formatValidationErrors } from '@/lib/validation'
import { logger, extractRequestContext } from '@/lib/logger'

// POST /api/user/withdraw - Request withdrawal
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const requestContext = extractRequestContext(req)
  
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      logger.authEvent('Withdrawal attempt - Unauthorized', false, requestContext)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const context = {
      ...requestContext,
      userId: session.user.id,
      action: 'WITHDRAW'
    }

    const body = await req.json()

    // Validate amount
    const validation = await validateRequest(withdrawalSchema, body)
    if (!validation.success) {
      logger.warn('Withdrawal failed - Validation error', {
        ...context,
        errors: formatValidationErrors(validation.errors)
      })
      return NextResponse.json(
        { error: formatValidationErrors(validation.errors) },
        { status: 400 }
      )
    }

    const { amount } = validation.data

    logger.info('Withdrawal request initiated', context)

    // Use transaction manager for atomic operations
    const { transaction: withdrawal } = await processWithdrawalTransaction(
      session.user.id,
      amount
    )

    const duration = Date.now() - startTime
    logger.paymentEvent('Withdrawal requested', amount, {
      ...context,
      withdrawalId: withdrawal.id,
      duration
    })

    return NextResponse.json(
      {
        message: 'Withdrawal request submitted successfully',
        withdrawal: {
          id: withdrawal.id,
          amount: withdrawal.amount.toString(),
          status: withdrawal.status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof Error) {
      // Business logic errors
      if (error.message.includes('KYC') || 
          error.message.includes('Insufficient') ||
          error.message.includes('not found')) {
        logger.warn('Withdrawal failed - Business logic error', {
          ...requestContext,
          error: error.message,
          duration
        })
        return NextResponse.json(
          { error: error.message },
          { status: error.message.includes('not found') ? 404 : 400 }
        )
      }
    }

    logger.error('Withdrawal error - Internal server error', error as Error, {
      ...requestContext,
      duration
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
