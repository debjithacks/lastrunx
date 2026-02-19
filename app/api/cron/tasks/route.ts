import { NextRequest, NextResponse } from 'next/server'
import { runScheduledTasks } from '@/lib/tournament-automation'
import { logger } from '@/lib/logger'

/**
 * API endpoint to trigger scheduled tasks
 * POST /api/cron/tasks
 * 
 * In production, secure this endpoint with:
 * 1. API key authentication
 * 2. IP whitelist
 * 3. Vercel Cron secret header
 */

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret (for Vercel Cron Jobs or similar)
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.securityEvent('Unauthorized cron task attempt', 'HIGH', {
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { taskType } = await req.json()

    if (!taskType || !['status', 'reminders', 'cleanup', 'all'].includes(taskType)) {
      return NextResponse.json(
        { error: 'Invalid task type. Must be: status, reminders, cleanup, or all' },
        { status: 400 }
      )
    }

    logger.info(`Cron task triggered: ${taskType}`)

    const result = await runScheduledTasks(taskType as 'status' | 'reminders' | 'cleanup' | 'all')

    return NextResponse.json(result)
  } catch (error) {
    logger.error('Cron task execution failed', error as Error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// For Vercel Cron Jobs - can be called without body
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const taskType = searchParams.get('task') || 'all'

    if (!['status', 'reminders', 'cleanup', 'all'].includes(taskType)) {
      return NextResponse.json(
        { error: 'Invalid task type' },
        { status: 400 }
      )
    }

    const result = await runScheduledTasks(taskType as 'status' | 'reminders' | 'cleanup' | 'all')

    return NextResponse.json(result)
  } catch (error) {
    logger.error('Cron task execution failed', error as Error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
