import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    useWarehouses,
    useDeleteWarehouse,
    useCreateWarehouse,
    useUpdateWarehouse,
} from '@/hooks/useWarehouses'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useCrudOperations } from '@/hooks'
import { FormModal, DeleteConfirmDialog } from '@/components/shared'
import type { Warehouse, WarehouseInput } from '@/services/WarehouseService'
import type { WarehouseFormValues } from '@/schemas'
import WarehouseForm from './WarehouseForm'
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi'

const WarehousesView = () => {
    const crud = useCrudOperations<Warehouse>()
    const offset = (crud.pageIndex - 1) * crud.pageSize

    const { data, isLoading } = useWarehouses({ limit: crud.pageSize, offset })
    const warehouses = data?.items ?? []
    const total = data?.pagination?.total ?? 0

    const deleteWarehouse = useDeleteWarehouse()
    const createWarehouse = useCreateWarehouse()
    const updateWarehouse = useUpdateWarehouse()
    const isPending = createWarehouse.isPending || updateWarehouse.isPending

    const handleFormSubmit = async (formData: WarehouseFormValues) => {
        try {
            if (crud.isEditOpen && crud.selectedItem) {
                await updateWarehouse.mutateAsync({
                    id: crud.selectedItem.id,
                    data: formData as WarehouseInput,
                })
                toast.push(
                    <Notification title="Bodega actualizada" type="success">
                        La bodega se actualizó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
            } else {
                await createWarehouse.mutateAsync(formData as WarehouseInput)
                toast.push(
                    <Notification title="Bodega creada" type="success">
                        La bodega se creó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
            }
            crud.closeAll()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al guardar la bodega')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const handleDeleteConfirm = async () => {
        if (!crud.selectedItem) return
        try {
            await deleteWarehouse.mutateAsync(crud.selectedItem.id)
            toast.push(
                <Notification title="Bodega eliminada" type="success">
                    La bodega se eliminó correctamente
                </Notification>,
                { placement: 'top-center' }
            )
            crud.closeAll()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al eliminar la bodega')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const columns: ColumnDef<Warehouse>[] = [
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
            header: 'Código',
            accessorKey: 'code',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="font-mono text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {row.original.code}
                    </span>
                )
            },
        },
        {
            header: 'Ciudad',
            accessorKey: 'city',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {row.original.city || '-'}
                    </span>
                )
            },
        },
        {
            header: 'Responsable',
            accessorKey: 'manager',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {row.original.manager || '-'}
                    </span>
                )
            },
        },
        {
            header: 'Por defecto',
            accessorKey: 'isDefault',
            cell: (props) => {
                const { row } = props
                return row.original.isDefault ? (
                    <Badge
                        content="Por defecto"
                        className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                    />
                ) : null
            },
        },
        {
            header: 'Estado',
            accessorKey: 'isActive',
            cell: (props) => {
                const { row } = props
                return (
                    <Badge
                        content={row.original.isActive ? 'Activo' : 'Inactivo'}
                        className={
                            row.original.isActive
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'
                        }
                    />
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
                            aria-label={`Editar ${row.original.name}`}
                            icon={<HiOutlinePencil />}
                            onClick={() => crud.openEdit(row.original)}
                        />
                        <Button
                            size="sm"
                            variant="plain"
                            aria-label={`Eliminar ${row.original.name}`}
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
                            <h4 className="text-lg font-semibold">Bodegas</h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestiona las bodegas de almacenamiento
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlus />}
                            onClick={crud.openCreate}
                        >
                            Nueva Bodega
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={warehouses}
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
                formId="warehouse-form"
                isOpen={crud.isCreateOpen || crud.isEditOpen}
                title={crud.isEditOpen ? 'Editar Bodega' : 'Nueva Bodega'}
                isSubmitting={isPending}
                onClose={crud.closeAll}
            >
                <WarehouseForm
                    formId="warehouse-form"
                    warehouse={crud.selectedItem}
                    isSubmitting={isPending}
                    onSubmit={handleFormSubmit}
                />
            </FormModal>

            <DeleteConfirmDialog
                isOpen={crud.isDeleteOpen}
                itemName={
                    crud.selectedItem
                        ? `${crud.selectedItem.name} (${crud.selectedItem.code})`
                        : undefined
                }
                isDeleting={deleteWarehouse.isPending}
                onClose={crud.closeAll}
                onConfirm={handleDeleteConfirm}
            />
        </>
    )
}

export default WarehousesView
