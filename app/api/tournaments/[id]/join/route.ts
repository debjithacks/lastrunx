import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { joinTournamentTransaction } from '@/lib/transaction-manager'
import { logger, extractRequestContext } from '@/lib/logger'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  const requestContext = extractRequestContext(req)
  
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      logger.authEvent('Tournament join attempt - Unauthorized', false, requestContext)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const context = {
      ...requestContext,
      userId: session.user.id,
      tournamentId: id,
      action: 'JOIN_TOURNAMENT'
    }

    logger.info('Tournament join attempt', context)

    // Get payment method from request body
    const body = await req.json()
    const paymentMethod = body.paymentMethod || 'wallet'
    const paymentId = body.paymentId || null

    // Use transaction manager to prevent race conditions
    const { registration, tournament } = await joinTournamentTransaction(
      session.user.id,
      id,
      paymentMethod,
      paymentId
    )

    const duration = Date.now() - startTime
    logger.tournamentEvent('User joined tournament successfully', id, {
      ...context,
      registrationId: registration.id,
      entryFee: Number(tournament.entryFee),
      duration
    })

    return NextResponse.json(
      { 
        message: 'Successfully registered for tournament',
        registration 
      },
      { status: 201 }
    )
  } catch (error) {
    const duration = Date.now() - startTime
    const { id } = await params
    
    if (error instanceof Error) {
      // Business logic errors (tournament full, already registered, etc.)
      if (error.message.includes('full') || 
          error.message.includes('registered') || 
          error.message.includes('Insufficient') ||
          error.message.includes('Cannot join')) {
        logger.warn('Tournament join failed - Business logic error', {
          ...requestContext,
          tournamentId: id,
          error: error.message,
          duration
        })
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    // Unexpected errors
    logger.error('Tournament join error - Internal server error', error as Error, {
      ...requestContext,
      tournamentId: id,
      duration
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
