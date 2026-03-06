import { ValidationError } from './errors'

export function createAuthorizationHeader(accessToken: string): string {
  const token = accessToken.trim()
  if (!token) {
    throw new ValidationError('accessToken is required')
  }
  return `Bearer ${token}`
}
