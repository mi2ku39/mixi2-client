import type {
  AddStampToPostRequest,
  AddStampToPostResponse,
  CreatePostRequest,
  CreatePostResponse,
  GetPostMediaStatusRequest,
  GetPostMediaStatusResponse,
  GetPostsRequest,
  GetPostsResponse,
  GetStampsRequest,
  GetStampsResponse,
  GetUsersRequest,
  GetUsersResponse,
  InitiatePostMediaUploadRequest,
  InitiatePostMediaUploadResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
} from '../generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'
import type { RpcCallOptions } from '../transport'

export type ApplicationApiClient = {
  getUsers: (request: GetUsersRequest, options?: RpcCallOptions) => Promise<GetUsersResponse>
  getPosts: (request: GetPostsRequest, options?: RpcCallOptions) => Promise<GetPostsResponse>
  createPost: (request: CreatePostRequest, options?: RpcCallOptions) => Promise<CreatePostResponse>
  initiatePostMediaUpload: (
    request: InitiatePostMediaUploadRequest,
    options?: RpcCallOptions,
  ) => Promise<InitiatePostMediaUploadResponse>
  getPostMediaStatus: (
    request: GetPostMediaStatusRequest,
    options?: RpcCallOptions,
  ) => Promise<GetPostMediaStatusResponse>
  sendChatMessage: (
    request: SendChatMessageRequest,
    options?: RpcCallOptions,
  ) => Promise<SendChatMessageResponse>
  getStamps: (request: GetStampsRequest, options?: RpcCallOptions) => Promise<GetStampsResponse>
  addStampToPost: (
    request: AddStampToPostRequest,
    options?: RpcCallOptions,
  ) => Promise<AddStampToPostResponse>
}
