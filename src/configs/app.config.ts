export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    tourPath: string
    locale: string
    enableMock: boolean
    inventoryApiHost?: string
    posApiHost?: string
    invoicingApiHost?: string
}

const appConfig: AppConfig = {
    apiPrefix: '',
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/',
    locale: 'en',
    enableMock: false,
    inventoryApiHost: 'http://localhost:3000/api/admin',
    posApiHost: 'http://localhost:3000/api/pos',
    invoicingApiHost: 'http://localhost:3173',
}

export default appConfig
