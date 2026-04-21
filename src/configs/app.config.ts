export type AppConfig = {
    apiPrefix: string
    apiBaseUrl: string
    authApiHost: string
    adminUsersApiHost: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    tourPath: string
    locale: string
    enableMock: boolean
    inventoryApiHost?: string
    posApiHost?: string
    invoicingApiHost?: string
}

const apiBaseUrl =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
    'http://localhost:3000'

const appConfig: AppConfig = {
    apiPrefix: '',
    apiBaseUrl,
    authApiHost: `${apiBaseUrl}/api/auth`,
    adminUsersApiHost: `${apiBaseUrl}/api/admin/users`,
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
