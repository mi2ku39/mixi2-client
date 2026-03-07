import { describe, expect, test } from 'vitest'

import * as root from '../src'
import * as generated from '../src/generated/mixi2-api-grpc.ts'

describe('public api barrel exports', () => {
  test('re-exports symbols from generated barrel', () => {
    expect(root.EventType).toBe(generated.EventType)
    expect(root.EventReason).toBe(generated.EventReason)
    expect(root.PostVisibility).toBe(generated.PostVisibility)
  })

  test('keeps stable service namespace exports', () => {
    const serviceNamespaces = Object.keys(root)
      .filter((key) => key.startsWith('social_mixi_application_service_'))
      .sort()

    expect(serviceNamespaces).toMatchSnapshot()
  })
})
