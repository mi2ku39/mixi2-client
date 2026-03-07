import { describe, expect, test } from 'vitest'

import {
  EventReason,
  EventType,
  eventReasonFromJSON,
  eventReasonToJSON,
  eventTypeFromJSON,
  eventTypeToJSON,
} from '../src'

describe('event enum json mapping', () => {
  test('maps known EventType values', () => {
    expect(eventTypeFromJSON('EVENT_TYPE_PING')).toBe(EventType.EVENT_TYPE_PING)
    expect(eventTypeToJSON(EventType.EVENT_TYPE_CHAT_MESSAGE_RECEIVED)).toBe('EVENT_TYPE_CHAT_MESSAGE_RECEIVED')
  })

  test('maps unknown EventType to UNRECOGNIZED', () => {
    expect(eventTypeFromJSON('UNKNOWN_EVENT')).toBe(EventType.UNRECOGNIZED)
    expect(eventTypeToJSON(EventType.UNRECOGNIZED)).toBe('UNRECOGNIZED')
  })

  test('maps known EventReason values', () => {
    expect(eventReasonFromJSON('EVENT_REASON_PING')).toBe(EventReason.EVENT_REASON_PING)
    expect(eventReasonToJSON(EventReason.EVENT_REASON_POST_QUOTED)).toBe('EVENT_REASON_POST_QUOTED')
  })
})
