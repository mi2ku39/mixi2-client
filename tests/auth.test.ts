import { describe, expect, test } from 'vitest'
import { createAuthorizationHeader, ValidationError } from '../src'

describe('createAuthorizationHeader', () => {
  test('returns bearer token header value', () => {
    expect(createAuthorizationHeader('my-token')).toBe('Bearer my-token')
  })

  test('throws ValidationError when token is blank', () => {
    expect(() => createAuthorizationHeader('   ')).toThrowError(ValidationError)
  })
})
