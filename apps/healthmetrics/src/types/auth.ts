// Authentication-related types

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface UserSession {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponse<T = unknown> {
  success: boolean;
  error?: AuthError;
  data?: T;
}
