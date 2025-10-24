/**
 * Environment Configuration
 * 
 * Centralized environment variable access with runtime validation.
 * Ensures required Supabase environment variables are present.
 */

export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

/**
 * Validates and returns environment configuration
 * @throws Error if required environment variables are missing
 */
export function getEnvConfig(): EnvConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required but not set');
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required but not set');
  }

  // Basic URL validation
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}

/**
 * Client-side environment configuration
 * Only use in client components ('use client')
 */
export function getClientEnvConfig(): EnvConfig {
  if (typeof window === 'undefined') {
    throw new Error('getClientEnvConfig() can only be called in client components');
  }
  
  return getEnvConfig();
}

/**
 * Server-side environment configuration
 * Only use in server components or API routes
 */
export function getServerEnvConfig(): EnvConfig {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnvConfig() can only be called in server components');
  }
  
  return getEnvConfig();
}
