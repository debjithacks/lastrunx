/**
 * Enhanced Error Logging System
 * Provides structured logging with different severity levels
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export interface LogContext {
  userId?: string
  action?: string
  resource?: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  requestId?: string
  [key: string]: any
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry
    
    let logString = `[${timestamp}] [${level}] ${message}`
    
    if (context && Object.keys(context).length > 0) {
      logString += ` | Context: ${JSON.stringify(context)}`
    }
    
    if (error) {
      logString += ` | Error: ${error.name}: ${error.message}`
      if (this.isDevelopment && error.stack) {
        logString += `\nStack: ${error.stack}`
      }
    }
    
    return logString
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      }
    }

    return entry
  }

  private log(entry: LogEntry): void {
    const formatted = this.formatLog(entry)

    switch (entry.level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formatted)
        }
        break
      case LogLevel.INFO:
        console.info(formatted)
        break
      case LogLevel.WARN:
        console.warn(formatted)
        break
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formatted)
        break
    }

    // In production, you could send logs to external service
    if (this.isProduction && (entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL)) {
      this.sendToExternalService(entry)
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // Placeholder for external logging service (e.g., Sentry, LogRocket, etc.)
    // TODO: Implement external logging service integration
  }

  debug(message: string, context?: LogContext): void {
    this.log(this.createLogEntry(LogLevel.DEBUG, message, context))
  }

  info(message: string, context?: LogContext): void {
    this.log(this.createLogEntry(LogLevel.INFO, message, context))
  }

  warn(message: string, context?: LogContext): void {
    this.log(this.createLogEntry(LogLevel.WARN, message, context))
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(this.createLogEntry(LogLevel.ERROR, message, context, error))
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log(this.createLogEntry(LogLevel.FATAL, message, context, error))
  }

  // API-specific logging methods
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${path}`, context)
  }

  apiResponse(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO
    const message = `API Response: ${method} ${path} - ${statusCode} (${duration}ms)`
    this.log(this.createLogEntry(level, message, context))
  }

  authEvent(event: string, success: boolean, context?: LogContext): void {
    const message = `Auth Event: ${event} - ${success ? 'Success' : 'Failed'}`
    this.log(this.createLogEntry(success ? LogLevel.INFO : LogLevel.WARN, message, context))
  }

  paymentEvent(event: string, amount: number, context?: LogContext): void {
    this.info(`Payment Event: ${event} - ₹${amount}`, context)
  }

  tournamentEvent(event: string, tournamentId: string, context?: LogContext): void {
    this.info(`Tournament Event: ${event}`, { ...context, tournamentId })
  }

  securityEvent(event: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', context?: LogContext): void {
    const level = severity === 'CRITICAL' || severity === 'HIGH' ? LogLevel.ERROR : LogLevel.WARN
    this.log(this.createLogEntry(level, `Security Event [${severity}]: ${event}`, context))
  }
}

// Export singleton instance
export const logger = new Logger()

// Helper function to extract request context
export function extractRequestContext(req: Request): LogContext {
  const headers = req.headers
  
  return {
    ipAddress: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
    userAgent: headers.get('user-agent') || 'unknown',
    requestId: headers.get('x-request-id') || crypto.randomUUID()
  }
}

// Error handlers
export function logDatabaseError(operation: string, error: Error, context?: LogContext): void {
  logger.error(`Database Error during ${operation}`, error, {
    ...context,
    operation,
    errorCode: (error as any).code
  })
}

export function logValidationError(field: string, message: string, context?: LogContext): void {
  logger.warn(`Validation Error: ${field} - ${message}`, {
    ...context,
    field,
    validationMessage: message
  })
}

export function logBusinessLogicError(operation: string, message: string, context?: LogContext): void {
  logger.warn(`Business Logic Error during ${operation}: ${message}`, {
    ...context,
    operation
  })
}

export function logSecurityViolation(violation: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', context?: LogContext): void {
  logger.securityEvent(violation, severity, context)
}
