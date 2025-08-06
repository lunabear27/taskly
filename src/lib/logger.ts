// Logger utility for development vs production
const isDevelopment = import.meta.env.DEV;

interface LoggerOptions {
  level?: "log" | "warn" | "error" | "info";
  group?: string;
}

class Logger {
  private prefix: string;

  constructor(prefix: string = "Taskly") {
    this.prefix = prefix;
  }

  private formatMessage(message: string, options?: LoggerOptions): string {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    const level = options?.level || "log";
    const group = options?.group ? `[${options.group}]` : "";

    return `${timestamp} ${this.prefix}${group} ${message}`;
  }

  log(message: string, data?: any, options?: LoggerOptions) {
    if (isDevelopment) {
      const formattedMessage = this.formatMessage(message, options);
      if (data) {
        console.log(formattedMessage, data);
      } else {
        console.log(formattedMessage);
      }
    }
  }

  warn(message: string, data?: any, options?: LoggerOptions) {
    if (isDevelopment) {
      const formattedMessage = this.formatMessage(message, {
        ...options,
        level: "warn",
      });
      if (data) {
        console.warn(formattedMessage, data);
      } else {
        console.warn(formattedMessage);
      }
    }
  }

  error(message: string, error?: any, options?: LoggerOptions) {
    // Always log errors, even in production (but with less detail)
    const formattedMessage = this.formatMessage(message, {
      ...options,
      level: "error",
    });

    if (isDevelopment) {
      if (error) {
        console.error(formattedMessage, error);
      } else {
        console.error(formattedMessage);
      }
    } else {
      // In production, log errors to a service or with minimal info
      console.error(formattedMessage);
    }
  }

  info(message: string, data?: any, options?: LoggerOptions) {
    if (isDevelopment) {
      const formattedMessage = this.formatMessage(message, {
        ...options,
        level: "info",
      });
      if (data) {
        console.info(formattedMessage, data);
      } else {
        console.info(formattedMessage);
      }
    }
  }

  // Special method for real-time updates (can be noisy)
  realtime(message: string, data?: any) {
    if (isDevelopment && import.meta.env.VITE_DEBUG_REALTIME === "true") {
      const formattedMessage = this.formatMessage(`🔄 ${message}`, {
        level: "log",
      });
      if (data) {
        console.log(formattedMessage, data);
      } else {
        console.log(formattedMessage);
      }
    }
  }

  // Method for performance logging
  performance(message: string, data?: any) {
    if (isDevelopment && import.meta.env.VITE_DEBUG_PERFORMANCE === "true") {
      const formattedMessage = this.formatMessage(`⚡ ${message}`, {
        level: "log",
      });
      if (data) {
        console.log(formattedMessage, data);
      } else {
        console.log(formattedMessage);
      }
    }
  }
}

// Create logger instances for different parts of the app
export const logger = new Logger("Taskly");
export const boardLogger = new Logger("Taskly:Boards");
export const authLogger = new Logger("Taskly:Auth");
export const realtimeLogger = new Logger("Taskly:Realtime");
export const errorLogger = new Logger("Taskly:Error");

// Export individual methods for convenience
export const { log, warn, error, info, realtime, performance } = logger;
