import {
  addStampToPost,
  createAuthorizationHeader,
  createPost,
  getPostMediaStatus,
  getPosts,
  getStamps,
  getUsers,
  initiatePostMediaUpload,
  issueOAuth2AccessTokenFromEnv,
  sendChatMessage,
  type ApplicationApiClient,
} from '../src'

const serviceClient: ApplicationApiClient = {
  getUsers: async (request) => ({ users: request.userIdList.map((id) => ({ id })) }) as never,
  getPosts: async (request) => ({ posts: request.postIdList.map((id) => ({ id })) }) as never,
  createPost: async (request) => ({ post: { id: 'post-created', text: request.text } }) as never,
  initiatePostMediaUpload: async () =>
    ({ mediaId: 'media-1', uploadUrl: 'https://upload.example.com/media-1' }) as never,
  getPostMediaStatus: async () => ({ status: 3 }) as never,
  sendChatMessage: async (request) => ({ message: { id: 'chat-1', text: request.text ?? '' } }) as never,
  getStamps: async () => ({ officialStampSets: [{ id: 'set-1' }] }) as never,
  addStampToPost: async (request) => ({ post: { id: request.postId } }) as never,
}

async function main() {
  const { accessToken, streamAddress } = await issueOAuth2AccessTokenFromEnv()
  const authorizationHeader = createAuthorizationHeader(accessToken)
  console.log('stream address:', streamAddress)
  console.log('authorization header:', authorizationHeader)

  const users = await getUsers(serviceClient, ['user-1'])
  console.log('getUsers result:', users.users)

  const posts = await getPosts(serviceClient, ['post-1'])
  console.log('getPosts result:', posts.posts)

  const created = await createPost(serviceClient, { text: 'Hello from mixi2-ts', mediaIdList: [] })
  console.log('createPost result:', created.post)

  const media = await initiatePostMediaUpload(serviceClient, {
    contentType: 'image/png',
    dataSize: 1024n,
    mediaType: 1,
  })
  console.log('initiatePostMediaUpload result:', media.mediaId, media.uploadUrl)

  const mediaStatus = await getPostMediaStatus(serviceClient, media.mediaId)
  console.log('getPostMediaStatus result:', mediaStatus.status)

  const message = await sendChatMessage(serviceClient, { roomId: 'room-1', text: 'Hi!' })
  console.log('sendChatMessage result:', message.message)

  const stamps = await getStamps(serviceClient, {})
  console.log('getStamps result:', stamps.officialStampSets)

  const stamped = await addStampToPost(serviceClient, 'post-1', 'stamp-1')
  console.log('addStampToPost result:', stamped.post)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
