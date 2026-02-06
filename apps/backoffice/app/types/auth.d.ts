/**
 * @pattern Value Object
 * @category Type Definitions
 * @purpose Type-safe authentication data structures aligned with backend JWT authentication
 */

/**
 * User role enumeration
 */
export type UserRole = 'admin' | 'editor'

/**
 * User entity (authenticated user profile)
 */
export interface User {
  id: string
  username: string
  role: UserRole
}

/**
 * Authentication response from backend login endpoint
 * Received from POST /api/auth/login
 */
export interface AuthResponse {
  access_token: string
  user: User
}

/**
 * Login credentials DTO
 * Sent to POST /api/auth/login
 */
export interface LoginCredentials {
  username: string
  password: string
}

/**
 * API error structure for authentication errors
 * Extends the base ApiError from product types
 */
export interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
}
