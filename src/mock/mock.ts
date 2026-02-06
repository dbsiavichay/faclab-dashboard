import { createServer } from 'miragejs'
import appConfig from '@/configs/app.config'

import { signInUserData } from './data/authData'
import { productData } from './data/productData'
import { categoryData } from './data/categoryData'
import { stockData } from './data/stockData'
import { movementData } from './data/movementData'

import { authFakeApi, inventoryFakeApi, categoryFakeApi } from './fakeApi'
import stockFakeApi from './fakeApi/stockFakeApi'
import movementFakeApi from './fakeApi/movementFakeApi'

const { apiPrefix } = appConfig

export function mockServer({ environment = 'test' }) {
    return createServer({
        environment,
        seeds(server) {
            server.db.loadData({
                signInUserData,
                productData,
                categoryData,
                stockData,
                movementData,
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
            categoryFakeApi(this, apiPrefix)
            stockFakeApi(this)
            movementFakeApi(this)
        },
    })
}
