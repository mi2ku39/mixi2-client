import type { Event } from '../generated/mixi2-api/social/mixi/application/model/v1/event_pb'
import type {
  SubscribeEventsRequest,
  SubscribeEventsResponse,
} from '../generated/mixi2-api/social/mixi/application/service/application_stream/v1/service_pb'
import type { RpcCallOptions } from '../transport'

export type ApplicationStreamClient = {
  subscribeEvents: (
    request: SubscribeEventsRequest,
    options?: RpcCallOptions,
  ) => AsyncIterable<SubscribeEventsResponse>
}

export type SubscribeEventsOptions = RpcCallOptions

export type SubscribeEventsResult = AsyncIterable<Event>
