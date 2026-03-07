import {
  InterceptingCall,
  Metadata,
  status,
  credentials,
  type ChannelCredentials,
  type ClientOptions,
  type Interceptor,
  type StatusObject,
} from '@grpc/grpc-js'

import {
  ApplicationServiceClient as ApplicationApiServiceClient,
  type ApplicationServiceClient as ApplicationApiClient,
} from '../generated/mixi2-api-grpc/social/mixi/application/service/application_api/v1/service'
import {
  ApplicationServiceClient as ApplicationStreamServiceClient,
  type ApplicationServiceClient as ApplicationStreamClient,
} from '../generated/mixi2-api-grpc/social/mixi/application/service/application_stream/v1/service'
import type { AccessTokenProvider } from '../auth'

export type DefaultServiceClient = {
  applicationApi: ApplicationApiClient
  applicationStream: ApplicationStreamClient
}

export type CreateDefaultServiceClientOptions = {
  baseUrl: string
  headers?: Record<string, string>
  accessToken?: string
  accessTokenProvider?: AccessTokenProvider
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

  return metadata
}

async function resolveAccessToken(options: CreateDefaultServiceClientOptions): Promise<string | undefined> {
  if (typeof options.accessTokenProvider === 'function') {
    const accessToken = await options.accessTokenProvider()

    if (typeof accessToken !== 'string' || accessToken.length === 0) {
      throw new Error('accessTokenProvider must return a non-empty string')
    }

    return accessToken
  }

  return options.accessToken
}

function createProviderErrorStatus(error: unknown): StatusObject {
  return {
    code: status.UNAUTHENTICATED,
    details:
      error instanceof Error
        ? `Failed to resolve access token from accessTokenProvider: ${error.message}`
        : 'Failed to resolve access token from accessTokenProvider',
    metadata: new Metadata(),
  }
}

function createClientOptions(
  options: CreateDefaultServiceClientOptions,
  defaultMetadata: Metadata,
): Partial<ClientOptions> {
  const interceptor: Interceptor = (interceptOptions, nextCall) => {
    return new InterceptingCall(nextCall(interceptOptions), {
      start: (metadata, listener, next) => {
        metadata.merge(defaultMetadata)

        if (metadata.get('authorization').length > 0) {
          next(metadata, listener)
          return
        }

        void resolveAccessToken(options)
          .then((accessToken) => {
            if (accessToken) {
              metadata.set('authorization', `Bearer ${accessToken}`)
            }

            next(metadata, listener)
          })
          .catch((error: unknown) => {
            next(metadata, {
              onReceiveStatus: (_, nextReceiveStatus) => {
                nextReceiveStatus(createProviderErrorStatus(error))
              },
            })
          })
      },
    })
  }

  return {
    interceptors: [interceptor],
  }
}

export function createDefaultServiceClient(options: CreateDefaultServiceClientOptions): DefaultServiceClient {
  const { address, credentials: channelCredentials } = toGrpcEndpoint(options.baseUrl)
  const clientOptions = createClientOptions(options, createMetadata(options))

  return {
    applicationApi: new ApplicationApiServiceClient(address, channelCredentials, clientOptions),
    applicationStream: new ApplicationStreamServiceClient(address, channelCredentials, clientOptions),
  }
}
