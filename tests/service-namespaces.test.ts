import { describe, expect, test } from 'vitest'

import { mixi2ApiGrpc } from '../src'

const applicationApi = mixi2ApiGrpc.service.social.mixi.application.application_api.v1.service
const applicationStream = mixi2ApiGrpc.service.social.mixi.application.application_stream.v1.service
const clientEndpoint = mixi2ApiGrpc.service.social.mixi.application.client_endpoint.v1.service

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
