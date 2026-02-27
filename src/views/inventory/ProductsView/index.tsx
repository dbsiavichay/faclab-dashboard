import { useState, useMemo } from 'react'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useProducts, useDeleteProduct } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useUnitsOfMeasure } from '@/hooks/useUnitsOfMeasure'
import type { Product } from '@/services/InventoryService'
import ProductForm from './ProductForm'
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi'

const ProductsView = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean
        product: Product | null
    }>({ open: false, product: null })

    const { data: products = [], isLoading } = useProducts()
    const { data: categories = [] } = useCategories()
    const { data: unitsOfMeasure = [] } = useUnitsOfMeasure()
    const deleteProduct = useDeleteProduct()

    // Create a lookup map for category ID to name
    const categoryMap = useMemo(() => {
        const map = new Map<number, string>()
        categories.forEach((cat) => map.set(cat.id, cat.name))
        return map
    }, [categories])

    // Create a lookup map for unit of measure ID to symbol
    const unitMap = useMemo(() => {
        const map = new Map<number, string>()
        unitsOfMeasure.forEach((u) => map.set(u.id, u.symbol))
        return map
    }, [unitsOfMeasure])

    const handleCreate = () => {
        setSelectedProduct(null)
        setIsFormOpen(true)
    }

    const handleEdit = (product: Product) => {
        setSelectedProduct(product)
        setIsFormOpen(true)
    }

    const handleDeleteClick = (product: Product) => {
        setDeleteDialog({ open: true, product })
    }

    const handleDeleteConfirm = async () => {
        if (deleteDialog.product) {
            try {
                await deleteProduct.mutateAsync(deleteDialog.product.id)
                toast.push(
                    <Notification title="Producto eliminado" type="success">
                        El producto se eliminó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
                setDeleteDialog({ open: false, product: null })
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    'Error al eliminar el producto'

                toast.push(
                    <Notification title="Error" type="danger">
                        {errorMessage}
                    </Notification>,
                    { placement: 'top-center' }
                )
            }
        }
    }

    const handleFormClose = () => {
        setIsFormOpen(false)
        setSelectedProduct(null)
    }

    const columns: ColumnDef<Product>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
            cell: (props) => {
                const { row } = props
                return <span className="font-medium">#{row.original.id}</span>
            },
        },
        {
            header: 'SKU',
            accessorKey: 'sku',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="font-mono text-sm">
                        {row.original.sku}
                    </span>
                )
            },
        },
        {
            header: 'Producto',
            accessorKey: 'name',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="font-semibold">{row.original.name}</span>
                )
            },
        },
        {
            header: 'Descripción',
            accessorKey: 'description',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {row.original.description || '-'}
                    </span>
                )
            },
        },
        {
            header: 'Categoría',
            accessorKey: 'categoryId',
            cell: (props) => {
                const { row } = props
                const categoryName = row.original.categoryId
                    ? categoryMap.get(row.original.categoryId)
                    : null
                return categoryName ? (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                        {categoryName}
                    </span>
                ) : (
                    <span className="text-gray-400">Sin categoría</span>
                )
            },
        },
        {
            header: 'Unidad',
            accessorKey: 'unitOfMeasureId',
            cell: (props) => {
                const { row } = props
                const unitSymbol = row.original.unitOfMeasureId
                    ? unitMap.get(row.original.unitOfMeasureId)
                    : null
                return unitSymbol ? (
                    <span className="font-mono text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {unitSymbol}
                    </span>
                ) : (
                    <span className="text-gray-400">-</span>
                )
            },
        },
        {
            header: 'Acciones',
            id: 'actions',
            cell: (props) => {
                const { row } = props
                return (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<HiOutlinePencil />}
                            onClick={() => handleEdit(row.original)}
                        />
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<HiOutlineTrash />}
                            onClick={() => handleDeleteClick(row.original)}
                        />
                    </div>
                )
            },
        },
    ]

    return (
        <>
            <Card>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h4 className="text-lg font-semibold">
                                Listado de Productos
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestiona el catálogo de productos
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlus />}
                            onClick={handleCreate}
                        >
                            Nuevo Producto
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={products}
                        loading={isLoading}
                    />
                </div>
            </Card>

            {/* Form Modal */}
            <ProductForm
                open={isFormOpen}
                product={selectedProduct}
                onClose={handleFormClose}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                isOpen={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, product: null })}
                onRequestClose={() =>
                    setDeleteDialog({ open: false, product: null })
                }
            >
                <h5 className="mb-4">Confirmar Eliminación</h5>
                <p className="mb-6">
                    ¿Estás seguro de que deseas eliminar el producto{' '}
                    <strong>{deleteDialog.product?.name}</strong>? Esta acción
                    no se puede deshacer.
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        disabled={deleteProduct.isPending}
                        onClick={() =>
                            setDeleteDialog({ open: false, product: null })
                        }
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={deleteProduct.isPending}
                        onClick={handleDeleteConfirm}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default ProductsView
