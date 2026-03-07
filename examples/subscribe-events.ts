import { Mixi2Client } from '../src'

async function main() {
  const controller = new AbortController()
  const client = new Mixi2Client({
    baseUrl: 'https://api.mixi.social',
    accessToken: process.env.MIXI2_ACCESS_TOKEN ?? 'dummy-token',
  })

  for await (const event of client.subscribeEvents({ signal: controller.signal })) {
    console.log('event case:', event.body.case)

    if (event.body.case === 'chatMessageEvent') {
      controller.abort()
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
