import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    useCategories,
    useDeleteCategory,
    useCreateCategory,
    useUpdateCategory,
} from '@/hooks/useCategories'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useCrudOperations } from '@/hooks'
import { FormModal, DeleteConfirmDialog } from '@/components/shared'
import type { Category } from '@/services/CategoryService'
import CategoryForm from './CategoryForm'
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi'

const CategoriesView = () => {
    const crud = useCrudOperations<Category>()
    const offset = (crud.pageIndex - 1) * crud.pageSize

    const { data, isLoading } = useCategories({ limit: crud.pageSize, offset })
    const categories = data?.items ?? []
    const total = data?.pagination?.total ?? 0

    const deleteCategory = useDeleteCategory()
    const createCategory = useCreateCategory()
    const updateCategory = useUpdateCategory()
    const isPending = createCategory.isPending || updateCategory.isPending

    const handleFormSubmit = async (formData: {
        name: string
        description: string
    }) => {
        try {
            if (crud.isEditOpen && crud.selectedItem) {
                await updateCategory.mutateAsync({
                    id: crud.selectedItem.id,
                    data: formData,
                })
                toast.push(
                    <Notification title="Categoría actualizada" type="success">
                        La categoría se actualizó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
            } else {
                await createCategory.mutateAsync(formData)
                toast.push(
                    <Notification title="Categoría creada" type="success">
                        La categoría se creó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
            }
            crud.closeAll()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al guardar la categoría')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const handleDeleteConfirm = async () => {
        if (!crud.selectedItem) return
        try {
            await deleteCategory.mutateAsync(crud.selectedItem.id)
            toast.push(
                <Notification title="Categoría eliminada" type="success">
                    La categoría se eliminó correctamente
                </Notification>,
                { placement: 'top-center' }
            )
            crud.closeAll()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al eliminar la categoría')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
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
                            onClick={() => crud.openEdit(row.original)}
                        />
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<HiOutlineTrash />}
                            onClick={() => crud.openDelete(row.original)}
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
                            onClick={crud.openCreate}
                        >
                            Nueva Categoría
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={categories}
                        loading={isLoading}
                        pagingData={{
                            total,
                            pageIndex: crud.pageIndex,
                            pageSize: crud.pageSize,
                        }}
                        onPaginationChange={(idx) =>
                            crud.onPaginationChange(idx, crud.pageSize)
                        }
                        onSelectChange={(size) =>
                            crud.onPaginationChange(1, size)
                        }
                    />
                </div>
            </Card>

            <FormModal
                formId="category-form"
                isOpen={crud.isCreateOpen || crud.isEditOpen}
                title={crud.isEditOpen ? 'Editar Categoría' : 'Nueva Categoría'}
                isSubmitting={isPending}
                onClose={crud.closeAll}
            >
                <CategoryForm
                    formId="category-form"
                    category={crud.selectedItem}
                    isSubmitting={isPending}
                    onSubmit={handleFormSubmit}
                />
            </FormModal>

            <DeleteConfirmDialog
                isOpen={crud.isDeleteOpen}
                itemName={crud.selectedItem?.name}
                isDeleting={deleteCategory.isPending}
                onClose={crud.closeAll}
                onConfirm={handleDeleteConfirm}
            />
        </>
    )
}

export default CategoriesView
