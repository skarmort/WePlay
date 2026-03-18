/**
 * Environment Configuration Loader for React Frontend
 * Automatically detects environment variables and provides sensible defaults
 * This ensures the app works even if .env is not set up
 */

const getEnv = (key: string, defaultValue: string = ''): string => {
  return process.env[`REACT_APP_${key}`] || defaultValue;
};

export const config = {
  // API Configuration
  api: {
    baseUrl: getEnv('API_URL', 'http://localhost:8081/api'),
    timeout: 30000,
  },

  // Environment
  environment: getEnv('ENVIRONMENT', 'development'),
  isDevelopment: getEnv('ENVIRONMENT', 'development') === 'development',
  isProduction: getEnv('ENVIRONMENT', 'development') === 'production',

  // App Configuration
  app: {
    name: 'WePlay',
    version: '1.0.0',
  },
};

export default config;
