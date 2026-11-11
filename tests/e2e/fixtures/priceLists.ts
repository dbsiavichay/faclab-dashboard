import type { Product } from '@/features/products/model/types'
import type {
    PriceList,
    PriceListItem,
    PriceListItemCreateInput,
} from '@/features/price-lists/model/types'
import { ADMIN, created, ok, paginated, type MockApi } from '../support/mockApi'
import { mockCatalog } from './catalog'

export const buildPriceList = (
    overrides: Partial<PriceList> = {}
): PriceList => ({
    id: 1,
    name: 'General',
    description: null,
    isDefault: true,
    isActive: true,
    validFrom: null,
    validTo: null,
    ...overrides,
})

/** La general de la empresa y una mayorista con un precio (S5.3) */
export const priceLists = (): PriceList[] => [
    buildPriceList(),
    buildPriceList({
        id: 2,
        name: 'Mayorista',
        description: 'Maestros y constructores',
        isDefault: false,
    }),
]

/**
 * Listas de precios con estado en memoria, sobre el catálogo (el selector de
 * producto lo busca ahí)
 */
export const mockPriceLists = (api: MockApi) => {
    const products: Product[] = mockCatalog(api)
    const lists = priceLists()
    const items: PriceListItem[] = []

    api.get(`${ADMIN}/products/:id`, ({ params }) =>
        ok(products.find((p) => p.id === Number(params.id)))
    )
    api.get(`${ADMIN}/price-lists`, ({ query }) => paginated(lists, query))
    api.get(`${ADMIN}/price-lists/:id`, ({ params }) =>
        ok(lists.find((list) => list.id === Number(params.id)))
    )
    api.post(`${ADMIN}/price-lists`, ({ body }) => {
        const list = buildPriceList({
            ...(body as Partial<PriceList>),
            id: Math.max(...lists.map((l) => l.id)) + 1,
            isDefault: false,
        })
        lists.push(list)
        return created(list)
    })
    api.get(`${ADMIN}/price-lists/:id/items`, ({ params, query }) =>
        paginated(
            items.filter((item) => item.priceListId === Number(params.id)),
            query
        )
    )
    api.post(`${ADMIN}/price-lists/:id/items`, ({ params, body }) => {
        const input = body as PriceListItemCreateInput
        const product = products.find((p) => p.id === input.productId)!
        const item: PriceListItem = {
            id: items.length + 1,
            priceListId: Number(params.id),
            productId: product.id,
            presentationId: product.id * 100,
            price: input.price,
            minQuantity: input.minQuantity,
            productName: product.name,
            productSku: product.sku,
            presentationName: 'Unidad',
            unitFactor: 1,
            isBasePresentation: true,
        }
        items.push(item)
        return created(item)
    })
}
