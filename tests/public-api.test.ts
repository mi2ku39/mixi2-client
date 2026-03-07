import { describe, expect, test } from 'vitest'

import * as root from '../src'
import * as generated from '../src/generated/mixi2-api-grpc.ts'

describe('public api barrel exports', () => {
  test('re-exports symbols from generated barrel', () => {
    expect(root.EventType).toBe(generated.EventType)
    expect(root.EventReason).toBe(generated.EventReason)
    expect(root.PostVisibility).toBe(generated.PostVisibility)
  })

  test('exposes expected service namespaces', () => {
    expect(root).toHaveProperty('social_mixi_application_service_application_api_v1_service')
    expect(root).toHaveProperty('social_mixi_application_service_application_stream_v1_service')
    expect(root).toHaveProperty('social_mixi_application_service_client_endpoint_v1_service')
  })
})
