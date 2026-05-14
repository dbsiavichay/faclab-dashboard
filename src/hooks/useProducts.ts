import { useProductMutations } from '@features/products'

export { useProductsList as useProducts, useProduct } from '@features/products'

export const useCreateProduct = () => useProductMutations().create
export const useUpdateProduct = () => useProductMutations().update
export const useDeleteProduct = () => useProductMutations().delete
