import type { Category } from '@/features/categories/model/types'
import type {
    Product,
    ProductPresentation,
} from '@/features/products/model/types'
import type { UnitOfMeasure } from '@/features/unitsOfMeasure/model/types'
import { ADMIN, created, ok, paginated, type MockApi } from '../support/mockApi'

export const categories = (): Category[] => [
    { id: 1, name: 'Tableros', description: 'MDF, melamina y aglomerado' },
    { id: 2, name: 'Herrajes', description: null },
]

export const unitsOfMeasure = (): UnitOfMeasure[] => [
    { id: 1, name: 'Unidad', symbol: 'u', isActive: true, decimals: 0 },
    { id: 2, name: 'Metro', symbol: 'm', isActive: true, decimals: 2 },
]

export const buildProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 1,
    name: 'Tablero MDF 15mm',
    sku: 'TAB-MDF-15',
    description: null,
    barcode: '7861234567890',
    categoryId: 1,
    unitOfMeasureId: 1,
    purchasePrice: 9.5,
    salePrice: 12.5,
    taxCode: 'VAT_15',
    constructionMaterialCode: null,
    isActive: true,
    isService: false,
    minStock: 10,
    maxStock: 200,
    reorderPoint: 25,
    leadTimeDays: 5,
    unitSymbol: 'u',
    quantityDecimals: 0,
    presentations: [],
    ...overrides,
})

/** The base presentation of a product: its unit, with its barcode and prices */
export const basePresentation = (product: Product): ProductPresentation => ({
    id: product.id * 100,
    productId: product.id,
    name: 'Unidad',
    factor: 1,
    barcode: product.barcode,
    salePrice: null,
    purchasePrice: null,
    isBase: true,
    isActive: true,
    effectiveSalePrice: product.salePrice,
    effectivePurchasePrice: product.purchasePrice,
    quantityDecimals: product.quantityDecimals,
})

export const productList = (): Product[] => [
    buildProduct(),
    buildProduct({
        id: 2,
        name: 'Bisagra cazoleta 35mm',
        sku: 'HER-BIS-35',
        barcode: null,
        categoryId: 2,
        purchasePrice: 0.6,
        salePrice: 0.95,
    }),
    buildProduct({
        id: 3,
        name: 'Servicio de corte',
        sku: 'SRV-CORTE',
        barcode: null,
        categoryId: null,
        isService: true,
        isActive: false,
        salePrice: 3,
    }),
]

/** Catálogo con estado en memoria para las pruebas de productos. */
export const mockCatalog = (
    api: MockApi,
    seed: Product[] = productList()
): Product[] => {
    const rows = [...seed]

    api.get(`${ADMIN}/categories`, ({ query }) =>
        paginated(categories(), query)
    )
    api.get(`${ADMIN}/units-of-measure`, ({ query }) =>
        paginated(unitsOfMeasure(), query)
    )
    api.get(`${ADMIN}/products`, ({ query }) => {
        const search = query.get('search')?.toLowerCase()
        return paginated(
            search
                ? rows.filter(
                      (row) =>
                          row.name.toLowerCase().includes(search) ||
                          row.sku.toLowerCase().includes(search)
                  )
                : rows,
            query
        )
    })
    api.post(`${ADMIN}/products`, ({ body }) => {
        const product = buildProduct({
            ...(body as Partial<Product>),
            id: Math.max(0, ...rows.map((row) => row.id)) + 1,
        })
        rows.unshift(product)
        return created(product)
    })
    api.put(`${ADMIN}/products/:id`, ({ params, body }) => {
        const product = rows.find((row) => row.id === Number(params.id))!
        Object.assign(product, body)
        return ok(product)
    })

    // Presentations (S5.2): the base one plus what each test adds
    const presentations = new Map<number, ProductPresentation[]>()
    const presentationsOf = (productId: number) => {
        const product = rows.find((row) => row.id === productId)!
        if (!presentations.has(productId)) {
            presentations.set(productId, [basePresentation(product)])
        }
        return presentations.get(productId)!
    }
    api.get(`${ADMIN}/products/:id/presentations`, ({ params }) =>
        ok(presentationsOf(Number(params.id)))
    )
    api.post(`${ADMIN}/products/:id/presentations`, ({ params, body }) => {
        const productId = Number(params.id)
        const product = rows.find((row) => row.id === productId)!
        const input = body as Partial<ProductPresentation>
        const list = presentationsOf(productId)
        const factor = input.factor ?? 1
        const presentation: ProductPresentation = {
            id: productId * 100 + list.length,
            productId,
            name: input.name ?? '',
            factor,
            barcode: input.barcode ?? null,
            salePrice: input.salePrice ?? null,
            purchasePrice: input.purchasePrice ?? null,
            isBase: false,
            isActive: input.isActive ?? true,
            effectiveSalePrice:
                input.salePrice ?? (product.salePrice ?? 0) * factor,
            effectivePurchasePrice:
                input.purchasePrice ?? (product.purchasePrice ?? 0) * factor,
            quantityDecimals: product.quantityDecimals,
        }
        list.push(presentation)
        return created(presentation)
    })

    return rows
}
