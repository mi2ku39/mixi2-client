import { issueOAuth2AccessTokenFromEnv, Mixi2Client } from '../src'

const { accessToken } = await issueOAuth2AccessTokenFromEnv()

const client = new Mixi2Client({
  baseUrl: 'https://api.mixi.social',
  accessToken,
})

async function main() {
  const users = await client.getUsers(['user-1'])
  console.log('getUsers result:', users.users)

  const posts = await client.getPosts(['post-1'])
  console.log('getPosts result:', posts.posts)

  const created = await client.createPost({
    text: 'Hello from mixi2-ts',
    mediaIdList: [],
  })
  console.log('createPost result:', created.post)

  const media = await client.initiatePostMediaUpload({
    contentType: 'image/png',
    dataSize: 1024n,
    mediaType: 1,
  })
  console.log('initiatePostMediaUpload result:', media.mediaId, media.uploadUrl)

  const mediaStatus = await client.getPostMediaStatus(media.mediaId)
  console.log('getPostMediaStatus result:', mediaStatus.status)

  const message = await client.sendChatMessage({
    roomId: 'room-1',
    text: 'Hi!',
  })
  console.log('sendChatMessage result:', message.message)

  const stamps = await client.getStamps({})
  console.log('getStamps result:', stamps.officialStampSets)

  const stamped = await client.addStampToPost('post-1', 'stamp-1')
  console.log('addStampToPost result:', stamped.post)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
