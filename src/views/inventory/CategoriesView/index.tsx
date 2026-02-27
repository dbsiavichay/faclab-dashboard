import { useState } from 'react'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useCategories, useDeleteCategory } from '@/hooks/useCategories'
import type { Category } from '@/services/CategoryService'
import CategoryForm from './CategoryForm'
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi'

const CategoriesView = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null
    )
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean
        category: Category | null
    }>({ open: false, category: null })

    const { data: categories = [], isLoading } = useCategories()
    const deleteCategory = useDeleteCategory()

    const handleCreate = () => {
        setSelectedCategory(null)
        setIsFormOpen(true)
    }

    const handleEdit = (category: Category) => {
        setSelectedCategory(category)
        setIsFormOpen(true)
    }

    const handleDeleteClick = (category: Category) => {
        setDeleteDialog({ open: true, category })
    }

    const handleDeleteConfirm = async () => {
        if (deleteDialog.category) {
            try {
                await deleteCategory.mutateAsync(deleteDialog.category.id)
                toast.push(
                    <Notification title="Categoría eliminada" type="success">
                        La categoría se eliminó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
                setDeleteDialog({ open: false, category: null })
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    'Error al eliminar la categoría'

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
        setSelectedCategory(null)
    }

    const columns: ColumnDef<Category>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
            cell: (props) => {
                const { row } = props
                return <span className="font-medium">#{row.original.id}</span>
            },
        },
        {
            header: 'Nombre',
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
                                Listado de Categorías
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestiona las categorías de productos
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlus />}
                            onClick={handleCreate}
                        >
                            Nueva Categoría
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={categories}
                        loading={isLoading}
                    />
                </div>
            </Card>

            {/* Form Modal */}
            <CategoryForm
                open={isFormOpen}
                category={selectedCategory}
                onClose={handleFormClose}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                isOpen={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, category: null })}
                onRequestClose={() =>
                    setDeleteDialog({ open: false, category: null })
                }
            >
                <h5 className="mb-4">Confirmar Eliminación</h5>
                <p className="mb-6">
                    ¿Estás seguro de que deseas eliminar la categoría{' '}
                    <strong>{deleteDialog.category?.name}</strong>? Esta acción
                    no se puede deshacer.
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        disabled={deleteCategory.isPending}
                        onClick={() =>
                            setDeleteDialog({ open: false, category: null })
                        }
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={deleteCategory.isPending}
                        onClick={handleDeleteConfirm}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default CategoriesView
