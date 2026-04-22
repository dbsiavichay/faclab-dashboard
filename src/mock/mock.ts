import { createServer } from 'miragejs'

import { usersData } from './data/authData'
import { productData } from './data/productData'
import { categoryData } from './data/categoryData'
import { stockData } from './data/stockData'
import { movementData } from './data/movementData'
import { customerData } from './data/customerData'
import { customerContactData } from './data/customerContactData'

import { inventoryFakeApi, categoryFakeApi } from './fakeApi'
import authFakeApi from './fakeApi/authFakeApi'
import adminUsersFakeApi from './fakeApi/adminUsersFakeApi'
import stockFakeApi from './fakeApi/stockFakeApi'
import movementFakeApi from './fakeApi/movementFakeApi'
import customerFakeApi from './fakeApi/customerFakeApi'
import customerContactFakeApi from './fakeApi/customerContactFakeApi'

export function mockServer({ environment = 'test' }) {
    return createServer({
        environment,
        seeds(server) {
            server.db.loadData({
                usersData,
                productData,
                categoryData,
                stockData,
                movementData,
                customerData,
                customerContactData,
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

            authFakeApi(this)
            adminUsersFakeApi(this)
            inventoryFakeApi(this, '')
            categoryFakeApi(this, '')
            stockFakeApi(this)
            movementFakeApi(this)
            customerFakeApi(this)
            customerContactFakeApi(this)
        },
    })
}
