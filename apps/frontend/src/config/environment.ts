/**
 * Environment configuration for the frontend application
 */

interface EnvironmentConfig {
  // Backend configuration
  backendUrl: string;
  wsUrl: string;
  apiUrl: string;
  
  // App configuration
  appName: string;
  appVersion: string;
  environment: 'development' | 'production' | 'test';
  
  // Feature flags
  enableDebugLogs: boolean;
  enablePerformanceMetrics: boolean;
  
  // Game configuration
  defaultTimeLimit: number;
  defaultRounds: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
}

/**
 * Get the current environment
 */
function getEnvironment(): 'development' | 'production' | 'test' {
  if (import.meta.env.MODE === 'production') return 'production';
  if (import.meta.env.MODE === 'test') return 'test';
  return 'development';
}

/**
 * Get the backend URL based on environment
 */
function getBackendUrl(): string {
  // Check for explicit environment variable first
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }

  const env = getEnvironment();
  
  switch (env) {
    case 'production':
      // In production, use the same host but different port
      return `${window.location.protocol}//${window.location.hostname}:3001`;
    case 'test':
      return 'http://localhost:3001';
    case 'development':
    default:
      return 'http://localhost:3001';
  }
}

/**
 * Get the WebSocket URL based on environment
 */
function getWebSocketUrl(): string {
  // Check for explicit environment variable first
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  const backendUrl = getBackendUrl();
  return backendUrl; // Socket.io uses the same URL as HTTP
}

/**
 * Environment configuration object
 */
export const config: EnvironmentConfig = {
  // Backend configuration
  backendUrl: getBackendUrl(),
  wsUrl: getWebSocketUrl(),
  apiUrl: `${getBackendUrl()}/api`,
  
  // App configuration
  appName: 'Geo Pin Quest',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: getEnvironment(),
  
  // Feature flags
  enableDebugLogs: getEnvironment() === 'development',
  enablePerformanceMetrics: getEnvironment() === 'development',
  
  // Game configuration
  defaultTimeLimit: 30, // seconds
  defaultRounds: 5,
  maxReconnectAttempts: 5,
  reconnectDelay: 2000, // milliseconds
};

/**
 * Development utilities
 */
export const dev = {
  /**
   * Log debug information (only in development)
   */
  log: (...args: unknown[]) => {
    if (config.enableDebugLogs) {
      console.log('[Dev]', ...args);
    }
  },
  
  /**
   * Log warning information (only in development)
   */
  warn: (...args: unknown[]) => {
    if (config.enableDebugLogs) {
      console.warn('[Dev]', ...args);
    }
  },
  
  /**
   * Log error information (only in development)
   */
  error: (...args: unknown[]) => {
    if (config.enableDebugLogs) {
      console.error('[Dev]', ...args);
    }
  },
  
  /**
   * Measure performance (only in development)
   */
  time: (label: string) => {
    if (config.enablePerformanceMetrics) {
      console.time(`[Performance] ${label}`);
    }
  },
  
  /**
   * End performance measurement (only in development)
   */
  timeEnd: (label: string) => {
    if (config.enablePerformanceMetrics) {
      console.timeEnd(`[Performance] ${label}`);
    }
  }
};

/**
 * Check if the app is running in development mode
 */
export const isDevelopment = config.environment === 'development';

/**
 * Check if the app is running in production mode
 */
export const isProduction = config.environment === 'production';

/**
 * Check if the app is running in test mode
 */
export const isTest = config.environment === 'test';

/**
 * Runtime configuration validation
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate required URLs
  if (!config.backendUrl) {
    errors.push('Backend URL is not configured');
  }
  
  if (!config.wsUrl) {
    errors.push('WebSocket URL is not configured');
  }
  
  // Validate URLs format
  try {
    new URL(config.backendUrl);
  } catch {
    errors.push('Backend URL is not a valid URL');
  }
  
  try {
    new URL(config.wsUrl);
  } catch {
    errors.push('WebSocket URL is not a valid URL');
  }
  
  // Validate game configuration
  if (config.defaultTimeLimit < 10 || config.defaultTimeLimit > 300) {
    errors.push('Default time limit must be between 10 and 300 seconds');
  }
  
  if (config.defaultRounds < 1 || config.defaultRounds > 10) {
    errors.push('Default rounds must be between 1 and 10');
  }
  
  if (config.maxReconnectAttempts < 1 || config.maxReconnectAttempts > 10) {
    errors.push('Max reconnect attempts must be between 1 and 10');
  }
  
  if (config.reconnectDelay < 1000 || config.reconnectDelay > 30000) {
    errors.push('Reconnect delay must be between 1000 and 30000 milliseconds');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate configuration on import in development
if (isDevelopment) {
  const validation = validateConfig();
  if (!validation.isValid) {
    console.error('❌ Configuration validation failed:', validation.errors);
  } else {
    console.log('✅ Configuration validated successfully');
  }
}
