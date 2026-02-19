import { NextRequest, NextResponse } from 'next/server'
import { logger, extractRequestContext } from './logger'

/**
 * Security Middleware Utilities
 * Common security checks for API routes
 */

// Maximum request body sizes (in bytes)
export const REQUEST_SIZE_LIMITS = {
  DEFAULT: 1024 * 1024, // 1MB
  FILE_UPLOAD: 10 * 1024 * 1024, // 10MB
  LARGE_PAYLOAD: 5 * 1024 * 1024, // 5MB
}

/**
 * Check request body size limit
 */
export async function checkRequestSize(
  req: NextRequest,
  maxSize: number = REQUEST_SIZE_LIMITS.DEFAULT
): Promise<{ valid: true; body: any } | { valid: false; response: NextResponse }> {
  try {
    const contentLength = req.headers.get('content-length')
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      const requestContext = extractRequestContext(req)
      logger.securityEvent(
        `Request body too large: ${contentLength} bytes (max: ${maxSize})`,
        'MEDIUM',
        requestContext
      )
      
      return {
        valid: false,
        response: NextResponse.json(
          { error: 'Request body too large' },
          { status: 413 }
        )
      }
    }

    const body = await req.json()
    
    // Additional check after parsing
    const bodySize = JSON.stringify(body).length
    if (bodySize > maxSize) {
      const requestContext = extractRequestContext(req)
      logger.securityEvent(
        `Parsed body too large: ${bodySize} bytes (max: ${maxSize})`,
        'MEDIUM',
        requestContext
      )
      
      return {
        valid: false,
        response: NextResponse.json(
          { error: 'Request body too large' },
          { status: 413 }
        )
      }
    }

    return { valid: true, body }
  } catch (error) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
  }
}

/**
 * Validate file upload
 */
export interface FileValidationOptions {
  maxSizeBytes: number
  allowedMimeTypes?: string[]
  allowedExtensions?: string[]
}

export function validateFileUpload(
  file: { name: string; type: string; size: number },
  options: FileValidationOptions
): { valid: true } | { valid: false; error: string } {
  // Check file size
  if (file.size > options.maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${Math.round(options.maxSizeBytes / 1024 / 1024)}MB limit`
    }
  }

  // Check MIME type
  if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`
    }
  }

  // Check file extension
  if (options.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !options.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension .${extension} not allowed. Allowed: ${options.allowedExtensions.join(', ')}`
      }
    }
  }

  return { valid: true }
}

/**
 * Allowed file types for different use cases
 */
export const FILE_UPLOAD_CONFIGS = {
  KYC_DOCUMENTS: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf']
  },
  TOURNAMENT_IMAGES: {
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp']
  },
  PROOF_SCREENSHOTS: {
    maxSizeBytes: 3 * 1024 * 1024, // 3MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    allowedExtensions: ['jpg', 'jpeg', 'png']
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

/**
 * Check for SQL injection patterns
 */
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(-{2}|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
    /(';|";|`)/
  ]

  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * Check for suspicious patterns
 */
export function detectSuspiciousActivity(req: NextRequest): {
  suspicious: boolean
  reason?: string
} {
  const requestContext = extractRequestContext(req)
  const userAgent = requestContext.userAgent || ''
  const url = req.url

  // Check for bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i
  ]

  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return {
      suspicious: true,
      reason: 'Bot detected'
    }
  }

  // Check for common attack patterns in URL
  const attackPatterns = [
    /\.\.\//, // Directory traversal
    /<script>/i, // XSS attempt
    /union.*select/i, // SQL injection
    /exec\(/i // Code execution
  ]

  if (attackPatterns.some(pattern => pattern.test(url))) {
    return {
      suspicious: true,
      reason: 'Attack pattern detected in URL'
    }
  }

  return { suspicious: false }
}

/**
 * Log suspicious activity
 */
export function logSuspiciousRequest(req: NextRequest, reason: string): void {
  const requestContext = extractRequestContext(req)
  logger.securityEvent(
    `Suspicious activity detected: ${reason}`,
    'HIGH',
    {
      ...requestContext,
      url: req.url,
      method: req.method
    }
  )
}

/**
 * CORS headers for API routes
 */
export function getCorsHeaders(origin?: string): HeadersInit {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
  const isAllowed = origin && allowedOrigins.includes(origin)

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }
}

/**
 * Rate limit information headers
 */
export function getRateLimitHeaders(result: {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
  }
}
