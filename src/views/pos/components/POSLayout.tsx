import POSHeader from './POSHeader'
import CategorySidebar from './CategorySidebar'
import SearchBar from './SearchBar'
import ProductGrid from './ProductGrid'

const POSLayout = () => {
    return (
        <div className="flex flex-col h-full">
            <POSHeader />
            <div className="flex flex-1 min-h-0">
                <div className="w-16 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                    <CategorySidebar />
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <SearchBar />
                    <ProductGrid />
                </div>

                <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        Panel de Orden (Sesión 5)
                    </div>
                </div>
            </div>
        </div>
    )
}

export default POSLayout
