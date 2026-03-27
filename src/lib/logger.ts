/**
 * Centralized logging and error handling utility.
 */

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  details?: any;
  timestamp: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private log(level: LogLevel, module: string, message: string, details?: any) {
    const entry: LogEntry = {
      level,
      module,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    const consoleMethod = level === LogLevel.ERROR || level === LogLevel.CRITICAL ? 'error' : level === LogLevel.WARN ? 'warn' : 'log';
    console[consoleMethod](`[${entry.timestamp}] [${level}] [${module}] ${message}`, details || '');
    
    // In a real app, we might send critical errors to a backend service here.
    if (level === LogLevel.CRITICAL) {
      this.reportCriticalError(entry);
    }
  }

  info(module: string, message: string, details?: any) {
    this.log(LogLevel.INFO, module, message, details);
  }

  warn(module: string, message: string, details?: any) {
    this.log(LogLevel.WARN, module, message, details);
  }

  error(module: string, message: string, details?: any) {
    this.log(LogLevel.ERROR, module, message, details);
  }

  critical(module: string, message: string, details?: any) {
    this.log(LogLevel.CRITICAL, module, message, details);
  }

  getLogs() {
    return [...this.logs];
  }

  private reportCriticalError(entry: LogEntry) {
    // Placeholder for reporting to an external service or alerting admins
    // For now, we'll just log that it's being reported.
    console.warn('Reporting critical error to monitoring service...', entry);
  }
}

export const logger = new Logger();
