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
    enableMock: false,
    inventoryApiHost: 'http://localhost:3000/api/admin',
}

export default appConfig
