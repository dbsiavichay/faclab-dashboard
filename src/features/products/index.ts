export type { Product, ProductInput, ProductListParams } from './model/types'

export { productSchema, type ProductFormValues } from './model/product.schema'

export {
    useProductsList,
    useProduct,
    useProductMutations,
} from './hooks/useProducts'

export { productsRoutes } from './routes'
