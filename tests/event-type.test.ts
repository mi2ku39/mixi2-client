import { describe, expect, test } from 'vitest'

import { mixi2ApiGrpc } from '../src'

const eventTypeModule = mixi2ApiGrpc.const.social.mixi.application.v1.event_type
const { EventReason, EventType, eventReasonFromJSON, eventReasonToJSON, eventTypeFromJSON, eventTypeToJSON } =
  eventTypeModule

describe('event enum json mapping', () => {
  test('keeps stable EventType json mapping table', () => {
    const eventTypeMappings = [
      EventType.EVENT_TYPE_UNSPECIFIED,
      EventType.EVENT_TYPE_PING,
      EventType.EVENT_TYPE_POST_CREATED,
      EventType.EVENT_TYPE_CHAT_MESSAGE_RECEIVED,
      EventType.UNRECOGNIZED,
    ].map((value) => ({
      value,
      name: eventTypeToJSON(value),
    }))

    expect(eventTypeMappings).toMatchSnapshot()
  })

  test('maps unknown EventType to UNRECOGNIZED', () => {
    expect(eventTypeFromJSON('UNKNOWN_EVENT')).toBe(EventType.UNRECOGNIZED)
    expect(eventTypeToJSON(EventType.UNRECOGNIZED)).toBe('UNRECOGNIZED')
  })

  test('keeps stable EventReason json mapping table', () => {
    const eventReasonMappings = [
      EventReason.EVENT_REASON_UNSPECIFIED,
      EventReason.EVENT_REASON_PING,
      EventReason.EVENT_REASON_POST_REPLY,
      EventReason.EVENT_REASON_POST_MENTIONED,
      EventReason.EVENT_REASON_POST_QUOTED,
      EventReason.EVENT_REASON_DIRECT_MESSAGE_RECEIVED,
      EventReason.UNRECOGNIZED,
    ].map((value) => ({
      value,
      name: eventReasonToJSON(value),
    }))

    expect(eventReasonMappings).toMatchSnapshot()
    expect(eventReasonFromJSON('EVENT_REASON_PING')).toBe(EventReason.EVENT_REASON_PING)
  })
})
