export * from './get-access-token'

export type AccessTokenProvider = () => Promise<string> | string
