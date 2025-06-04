import { createServer } from 'miragejs'
import appConfig from '@/configs/app.config'

import { signInUserData } from './data/authData'
import { productData } from './data/productData'

import { authFakeApi, inventoryFakeApi } from './fakeApi'

const { apiPrefix } = appConfig

export function mockServer({ environment = 'test' }) {
    return createServer({
        environment,
        seeds(server) {
            server.db.loadData({
                signInUserData,
                productData,
            })
        },
        routes() {
            this.urlPrefix = ''
            this.namespace = ''
            this.passthrough((request) => {
                const isExternal = request.url.startsWith('http')
                return isExternal
            })
            this.passthrough()

            authFakeApi(this, apiPrefix)
            inventoryFakeApi(this, apiPrefix)
        },
    })
}
