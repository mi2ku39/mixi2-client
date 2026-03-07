import {
  InterceptingCall,
  Metadata,
  credentials,
  type ChannelCredentials,
  type ClientOptions,
  type Interceptor,
} from '@grpc/grpc-js'

import {
  ApplicationServiceClient as ApplicationApiServiceClient,
  type ApplicationServiceClient as ApplicationApiClient,
} from '../generated/mixi2-api-grpc/social/mixi/application/service/application_api/v1/service'
import {
  ApplicationServiceClient as ApplicationStreamServiceClient,
  type ApplicationServiceClient as ApplicationStreamClient,
} from '../generated/mixi2-api-grpc/social/mixi/application/service/application_stream/v1/service'

export type DefaultServiceClient = {
  applicationApi: ApplicationApiClient
  applicationStream: ApplicationStreamClient
}

export type CreateDefaultServiceClientOptions = {
  baseUrl: string
  headers?: Record<string, string>
  accessToken?: string
}

function toGrpcEndpoint(baseUrl: string): { address: string; credentials: ChannelCredentials } {
  if (!baseUrl) {
    throw new Error('baseUrl is required')
  }

  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    const url = new URL(baseUrl)

    return {
      address: url.host,
      credentials: url.protocol === 'https:' ? credentials.createSsl() : credentials.createInsecure(),
    }
  }

  return {
    address: baseUrl,
    credentials: credentials.createInsecure(),
  }
}

function createMetadata(options: CreateDefaultServiceClientOptions): Metadata {
  const metadata = new Metadata()

  for (const [key, value] of Object.entries(options.headers ?? {})) {
    metadata.set(key, value)
  }

  if (options.accessToken && !metadata.get('authorization').length) {
    metadata.set('authorization', `Bearer ${options.accessToken}`)
  }

  return metadata
}

function createClientOptions(defaultMetadata: Metadata): Partial<ClientOptions> {
  const interceptor: Interceptor = (interceptOptions, nextCall) => {
    return new InterceptingCall(nextCall(interceptOptions), {
      start: (metadata, listener, next) => {
        metadata.merge(defaultMetadata)
        next(metadata, listener)
      },
    })
  }

  return {
    interceptors: [interceptor],
  }
}

export function createDefaultServiceClient(options: CreateDefaultServiceClientOptions): DefaultServiceClient {
  const { address, credentials: channelCredentials } = toGrpcEndpoint(options.baseUrl)
  const clientOptions = createClientOptions(createMetadata(options))

  return {
    applicationApi: new ApplicationApiServiceClient(address, channelCredentials, clientOptions),
    applicationStream: new ApplicationStreamServiceClient(address, channelCredentials, clientOptions),
  }
}
