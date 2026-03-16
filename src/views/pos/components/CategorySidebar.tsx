import { useCategories } from '@/hooks/useCategories'
import { usePOSStore } from '@/stores/usePOSStore'
import { HiOutlineViewGrid, HiOutlineTag } from 'react-icons/hi'

const CategorySidebar = () => {
    const { data } = useCategories({ limit: 100 })
    const selectedCategoryId = usePOSStore((s) => s.selectedCategoryId)
    const setSelectedCategory = usePOSStore((s) => s.setSelectedCategory)

    const categories = data?.items || []

    const baseClass =
        'p-3 rounded-lg transition-colors flex items-center justify-center'
    const activeClass =
        'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400'
    const inactiveClass =
        'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'

    return (
        <div className="flex flex-col items-center py-4 gap-2">
            <button
                className={`${baseClass} ${
                    selectedCategoryId === null ? activeClass : inactiveClass
                }`}
                title="Todos"
                onClick={() => setSelectedCategory(null)}
            >
                <HiOutlineViewGrid className="text-xl" />
            </button>

            {categories.map((cat) => (
                <button
                    key={cat.id}
                    className={`${baseClass} ${
                        selectedCategoryId === cat.id
                            ? activeClass
                            : inactiveClass
                    }`}
                    title={cat.name}
                    onClick={() => setSelectedCategory(cat.id)}
                >
                    <HiOutlineTag className="text-xl" />
                </button>
            ))}
        </div>
    )
}

export default CategorySidebar
