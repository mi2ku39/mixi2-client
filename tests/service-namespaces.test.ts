import { describe, expect, test } from 'vitest'

import {
  social_mixi_application_service_application_api_v1_service as applicationApi,
  social_mixi_application_service_application_stream_v1_service as applicationStream,
  social_mixi_application_service_client_endpoint_v1_service as clientEndpoint,
} from '../src'

describe('service namespace exports', () => {
  test('keeps stable application api service definitions', () => {
    const rpcSummary = Object.entries(applicationApi.ApplicationServiceService).map(([name, definition]) => ({
      name,
      path: definition.path,
      requestStream: definition.requestStream,
      responseStream: definition.responseStream,
    }))

    expect({
      serviceName: applicationApi.ApplicationServiceClient.serviceName,
      rpcSummary,
    }).toMatchSnapshot()
  })

  test('keeps stable application stream service definitions', () => {
    const rpcSummary = Object.entries(applicationStream.ApplicationServiceService).map(([name, definition]) => ({
      name,
      path: definition.path,
      requestStream: definition.requestStream,
      responseStream: definition.responseStream,
    }))

    expect({
      serviceName: applicationStream.ApplicationServiceClient.serviceName,
      rpcSummary,
    }).toMatchSnapshot()
  })

  test('keeps stable client endpoint message codec surface', () => {
    const messageCodecSurface = {
      exportedKeys: Object.keys(clientEndpoint).sort(),
      sendEventRequestMethods: Object.keys(clientEndpoint.SendEventRequest).sort(),
    }

    expect(messageCodecSurface).toMatchSnapshot()
  })
})
