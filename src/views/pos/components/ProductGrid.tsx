import { usePOSProducts, usePOSSearchProducts } from '@/hooks/usePOS'
import { usePOSStore } from '@/stores/usePOSStore'
import ProductCard from './ProductCard'
import Skeleton from '@/components/ui/Skeleton'

const ProductGrid = () => {
    const searchTerm = usePOSStore((s) => s.searchTerm)
    const selectedCategoryId = usePOSStore((s) => s.selectedCategoryId)

    const { data: allProducts, isLoading: allLoading } = usePOSProducts()
    const { data: searchResults, isLoading: searchLoading } =
        usePOSSearchProducts(searchTerm)

    const isSearching = searchTerm.length >= 2
    const isLoading = isSearching ? searchLoading : allLoading

    const products = isSearching
        ? searchResults || []
        : (allProducts || []).filter(
              (p) =>
                  selectedCategoryId === null ||
                  p.categoryId === selectedCategoryId
          )

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="rounded-lg overflow-hidden">
                        <Skeleton height={160} />
                        <div className="p-3 space-y-2">
                            <Skeleton height={16} />
                            <Skeleton height={20} width="60%" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                No se encontraron productos
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}

export default ProductGrid
