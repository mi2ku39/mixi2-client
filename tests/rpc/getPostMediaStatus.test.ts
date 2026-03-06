import { create } from '@bufbuild/protobuf'
import { describe, expect, test, vi } from 'vitest'
import { TransportError, ValidationError, getPostMediaStatus } from '../../src'
import {
  GetPostMediaStatusResponseSchema,
  GetPostMediaStatusResponse_Status,
  type GetPostMediaStatusRequest,
} from '../../src/generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'

describe('getPostMediaStatus RPC', () => {
  test('calls getPostMediaStatus with media id', async () => {
    const getPostMediaStatusMock = vi
      .fn<
        (
          request: GetPostMediaStatusRequest,
        ) => Promise<ReturnType<typeof create<typeof GetPostMediaStatusResponseSchema>>>
      >()
      .mockResolvedValue(
        create(GetPostMediaStatusResponseSchema, {
          status: GetPostMediaStatusResponse_Status.COMPLETED,
        }),
      )

    await getPostMediaStatus({ getPostMediaStatus: getPostMediaStatusMock }, 'media-1')

    expect(getPostMediaStatusMock).toHaveBeenCalledTimes(1)
    expect(getPostMediaStatusMock.mock.calls[0]?.[0].mediaId).toBe('media-1')
  })

  test('throws ValidationError when mediaId is empty', async () => {
    await expect(getPostMediaStatus({ getPostMediaStatus: vi.fn() }, '   ')).rejects.toBeInstanceOf(
      ValidationError,
    )
  })

  test('normalizes errors as TransportError', async () => {
    const getPostMediaStatusMock = vi.fn().mockRejectedValue(new Error('internal'))

    await expect(
      getPostMediaStatus({ getPostMediaStatus: getPostMediaStatusMock }, 'media-1'),
    ).rejects.toBeInstanceOf(TransportError)
  })
})
