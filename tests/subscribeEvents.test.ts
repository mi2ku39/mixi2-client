import { create } from '@bufbuild/protobuf'
import { describe, expect, test, vi } from 'vitest'
import { Mixi2Client, ValidationError } from '../src'
import {
  EventSchema,
  PingEventSchema,
  PostCreatedEventSchema,
} from '../src/generated/mixi2-api/social/mixi/application/model/v1/event_pb'
import {
  SubscribeEventsResponseSchema,
  type SubscribeEventsRequest,
  type SubscribeEventsResponse,
} from '../src/generated/mixi2-api/social/mixi/application/service/application_stream/v1/service_pb'

describe('Mixi2Client#subscribeEvents', () => {
  test('returns Event type as-is and keeps oneof typing including ping events', async () => {
    const subscribeEventsMock = vi.fn<(request: SubscribeEventsRequest) => AsyncIterable<SubscribeEventsResponse>>()
    subscribeEventsMock.mockReturnValue(
      (async function* () {
        yield create(SubscribeEventsResponseSchema, {
          events: [
            create(EventSchema, {
              eventId: 'event-1',
              body: {
                case: 'pingEvent',
                value: create(PingEventSchema),
              },
            }),
            create(EventSchema, {
              eventId: 'event-2',
              body: {
                case: 'postCreatedEvent',
                value: create(PostCreatedEventSchema),
              },
            }),
          ],
        })
      })(),
    )

    const client = new Mixi2Client({
      baseUrl: 'https://example.com',
      accessToken: 'token',
      serviceClient: { getUsers: vi.fn() },
      streamServiceClient: { subscribeEvents: subscribeEventsMock },
    })

    const events = []
    for await (const event of client.subscribeEvents()) {
      events.push(event)
    }

    expect(events).toHaveLength(2)
    expect(events[0]?.body.case).toBe('pingEvent')
    expect(events[1]?.body.case).toBe('postCreatedEvent')
  })

  test('propagates long-running stream errors', async () => {
    const streamError = new Error('stream disconnected')
    const subscribeEventsMock = vi
      .fn<(request: SubscribeEventsRequest) => AsyncIterable<SubscribeEventsResponse>>()
      .mockReturnValue(
        (async function* () {
          yield create(SubscribeEventsResponseSchema)
          throw streamError
        })(),
      )

    const client = new Mixi2Client({
      baseUrl: 'https://example.com',
      accessToken: 'token',
      serviceClient: { getUsers: vi.fn() },
      streamServiceClient: { subscribeEvents: subscribeEventsMock },
    })

    const consume = async () => {
      for await (const _event of client.subscribeEvents()) {
        // no-op
      }
    }

    await expect(consume()).rejects.toThrowError(streamError)
  })

  test('finishes on stream completion', async () => {
    const subscribeEventsMock = vi
      .fn<(request: SubscribeEventsRequest) => AsyncIterable<SubscribeEventsResponse>>()
      .mockReturnValue(
        (async function* () {
          yield create(SubscribeEventsResponseSchema)
        })(),
      )

    const client = new Mixi2Client({
      baseUrl: 'https://example.com',
      accessToken: 'token',
      serviceClient: { getUsers: vi.fn() },
      streamServiceClient: { subscribeEvents: subscribeEventsMock },
    })

    const events = []
    for await (const event of client.subscribeEvents()) {
      events.push(event)
    }

    expect(events).toHaveLength(0)
  })

  test('cancels stream with AbortSignal and closes iterator', async () => {
    const iteratorClosed = vi.fn()
    const pending = new Promise<IteratorResult<SubscribeEventsResponse>>((resolve) => {
      setTimeout(() => {
        resolve({ done: true, value: undefined })
      }, 5000)
    })

    const mockStream: AsyncIterable<SubscribeEventsResponse> = {
      [Symbol.asyncIterator]() {
        return {
          next: vi.fn(async () => pending),
          return: vi.fn(async () => {
            iteratorClosed()
            return { done: true, value: undefined }
          }),
        }
      },
    }

    const subscribeEventsMock = vi
      .fn<(request: SubscribeEventsRequest) => AsyncIterable<SubscribeEventsResponse>>()
      .mockReturnValue(mockStream)

    const client = new Mixi2Client({
      baseUrl: 'https://example.com',
      accessToken: 'token',
      serviceClient: { getUsers: vi.fn() },
      streamServiceClient: { subscribeEvents: subscribeEventsMock },
    })

    const abortController = new AbortController()
    const consume = (async () => {
      for await (const _event of client.subscribeEvents({ signal: abortController.signal })) {
        // no-op
      }
    })()

    abortController.abort()
    await consume

    expect(iteratorClosed).toHaveBeenCalled()
    expect(subscribeEventsMock.mock.calls[0]?.[1]?.signal).toBe(abortController.signal)
  })

  test('throws when stream client is not provided', () => {
    const client = new Mixi2Client({
      baseUrl: 'https://example.com',
      accessToken: 'token',
      serviceClient: { getUsers: vi.fn() },
    })

    expect(() => client.subscribeEvents()).toThrowError(ValidationError)
  })
})
