import { create } from '@bufbuild/protobuf'
import { describe, expect, test, vi } from 'vitest'
import { TransportError, ValidationError, getUsers } from '../../src'
import {
  GetUsersResponseSchema,
  type GetUsersRequest,
} from '../../src/generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'

describe('getUsers RPC', () => {
  test('calls getUsers with user ids', async () => {
    const getUsersMock = vi
      .fn<(request: GetUsersRequest) => Promise<ReturnType<typeof create<typeof GetUsersResponseSchema>>>>()
      .mockResolvedValue(create(GetUsersResponseSchema))

    await getUsers({ getUsers: getUsersMock }, ['user-1'])

    expect(getUsersMock).toHaveBeenCalledTimes(1)
    expect(getUsersMock.mock.calls[0]?.[0].userIdList).toEqual(['user-1'])
  })

  test('throws ValidationError when userIdList is empty', async () => {
    await expect(getUsers({ getUsers: vi.fn() }, [])).rejects.toBeInstanceOf(ValidationError)
  })

  test('normalizes errors as TransportError', async () => {
    const getUsersMock = vi.fn().mockRejectedValue(new Error('unauthorized'))

    await expect(getUsers({ getUsers: getUsersMock }, ['user-1'])).rejects.toBeInstanceOf(
      TransportError,
    )
  })
})
