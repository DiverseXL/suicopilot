export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

function log(level: LogLevel, message: string, data?: any) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
  };
  console.log(JSON.stringify(entry));
}

export const logger = {
  info: (msg: string, data?: any) => log(LogLevel.INFO, msg, data),
  warn: (msg: string, data?: any) => log(LogLevel.WARN, msg, data),
  error: (msg: string, data?: any) => log(LogLevel.ERROR, msg, data),
  debug: (msg: string, data?: any) => log(LogLevel.DEBUG, msg, data),
};
