export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    tourPath: string
    locale: string
    enableMock: boolean
    inventoryApiHost?: string
}

const appConfig: AppConfig = {
    apiPrefix: '',
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/',
    locale: 'en',
    enableMock: true,
    inventoryApiHost: 'http://localhost:3000',
}

export default appConfig
