import { describe, expect, test } from 'vitest'

import {
  social_mixi_application_service_application_api_v1_service as applicationApi,
  social_mixi_application_service_application_stream_v1_service as applicationStream,
  social_mixi_application_service_client_endpoint_v1_service as clientEndpoint,
} from '../src'

describe('service namespace exports', () => {
  test('application api service exports grpc definitions', () => {
    expect(applicationApi).toHaveProperty('ApplicationServiceService')
    expect(applicationApi).toHaveProperty('ApplicationServiceClient')
    expect(applicationApi).toHaveProperty('GetUsersRequest')

    expect(applicationApi.ApplicationServiceService.getUsers.path).toBe(
      '/social.mixi.application.service.application_api.v1.ApplicationService/GetUsers',
    )
    expect(applicationApi.ApplicationServiceClient.serviceName).toBe(
      'social.mixi.application.service.application_api.v1.ApplicationService',
    )
  })

  test('application stream service exports stream rpc definitions', () => {
    expect(applicationStream).toHaveProperty('ApplicationServiceService')
    expect(applicationStream).toHaveProperty('ApplicationServiceClient')

    expect(applicationStream.ApplicationServiceService.subscribeEvents.path).toBe(
      '/social.mixi.application.service.application_stream.v1.ApplicationService/SubscribeEvents',
    )
    expect(applicationStream.ApplicationServiceClient.serviceName).toBe(
      'social.mixi.application.service.application_stream.v1.ApplicationService',
    )
  })

  test('client endpoint service exports message codec', () => {
    expect(clientEndpoint).toHaveProperty('SendEventRequest')
    expect(typeof clientEndpoint.SendEventRequest.encode).toBe('function')
    expect(typeof clientEndpoint.SendEventRequest.decode).toBe('function')
  })
})
