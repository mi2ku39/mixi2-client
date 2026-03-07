import { describe, expect, test } from 'vitest'

import * as root from '../src'
import * as generated from '../src/generated/mixi2-api-grpc.ts'

describe('public api barrel exports', () => {
  test('re-exports generated root object from generated barrel', () => {
    expect(root.mixi2ApiGrpc).toBe(generated.mixi2ApiGrpc)
  })

  test('keeps stable grouped service namespace keys', () => {
    const serviceNamespaces = Object.keys(root.mixi2ApiGrpc.service.social.mixi.application)
      .sort()

    expect(serviceNamespaces).toMatchSnapshot()
  })
})
