import { create } from '@bufbuild/protobuf'
import { describe, expect, test, vi } from 'vitest'
import { Mixi2Client } from '../src'
import {
  GetUsersResponseSchema,
  type GetUsersRequest,
} from '../src/generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'

describe('Mixi2Client#getUsers', () => {
  test('delegates to separated getUsers RPC', async () => {
    const getUsersMock = vi
      .fn<(request: GetUsersRequest) => Promise<ReturnType<typeof create<typeof GetUsersResponseSchema>>>>()
      .mockResolvedValue(create(GetUsersResponseSchema))

    const client = new Mixi2Client({ accessToken: 'token', serviceClient: { getUsers: getUsersMock } })

    await client.getUsers(['user-1'])

    expect(getUsersMock).toHaveBeenCalledTimes(1)
  })
})
