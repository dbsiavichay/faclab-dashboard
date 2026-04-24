import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi'
import {
    useDeleteUnitOfMeasure,
    useUnitsOfMeasure,
    useCreateUnitOfMeasure,
    useUpdateUnitOfMeasure,
} from '@/hooks/useUnitsOfMeasure'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Notification from '@/components/ui/Notification'
import type {
    UnitOfMeasure,
    UnitOfMeasureInput,
} from '@/services/UnitOfMeasureService'
import UnitOfMeasureForm from './UnitOfMeasureForm'
import { getErrorMessage } from '@/utils/getErrorMessage'
import toast from '@/components/ui/toast'
import { useCrudOperations } from '@/hooks'
import { FormModal, DeleteConfirmDialog } from '@/components/shared'

const UnitsOfMeasureView = () => {
    const crud = useCrudOperations<UnitOfMeasure>()
    const offset = (crud.pageIndex - 1) * crud.pageSize

    const { data, isLoading } = useUnitsOfMeasure({
        limit: crud.pageSize,
        offset,
    })
    const units = data?.items ?? []
    const total = data?.pagination?.total ?? 0

    const deleteUnit = useDeleteUnitOfMeasure()
    const createUnit = useCreateUnitOfMeasure()
    const updateUnit = useUpdateUnitOfMeasure()
    const isPending = createUnit.isPending || updateUnit.isPending

    const handleFormSubmit = async (formData: UnitOfMeasureInput) => {
        try {
            if (crud.isEditOpen && crud.selectedItem) {
                await updateUnit.mutateAsync({
                    id: crud.selectedItem.id,
                    data: formData,
                })
                toast.push(
                    <Notification title="Unidad actualizada" type="success">
                        La unidad de medida se actualizó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
            } else {
                await createUnit.mutateAsync(formData)
                toast.push(
                    <Notification title="Unidad creada" type="success">
                        La unidad de medida se creó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
            }
            crud.closeAll()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(
                        error,
                        'Error al guardar la unidad de medida'
                    )}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const handleDeleteConfirm = async () => {
        if (!crud.selectedItem) return
        try {
            await deleteUnit.mutateAsync(crud.selectedItem.id)
            toast.push(
                <Notification title="Unidad eliminada" type="success">
                    La unidad de medida se eliminó correctamente
                </Notification>,
                { placement: 'top-center' }
            )
            crud.closeAll()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(
                        error,
                        'Error al eliminar la unidad de medida'
                    )}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const columns: ColumnDef<UnitOfMeasure>[] = [
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
            header: 'Símbolo',
            accessorKey: 'symbol',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="font-mono text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {row.original.symbol}
                    </span>
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
                            <h4 className="text-lg font-semibold">
                                Unidades de Medida
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestiona las unidades de medida de los productos
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlus />}
                            onClick={crud.openCreate}
                        >
                            Nueva Unidad
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={units}
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
                formId="unit-of-measure-form"
                isOpen={crud.isCreateOpen || crud.isEditOpen}
                title={
                    crud.isEditOpen
                        ? 'Editar Unidad de Medida'
                        : 'Nueva Unidad de Medida'
                }
                isSubmitting={isPending}
                onClose={crud.closeAll}
            >
                <UnitOfMeasureForm
                    formId="unit-of-measure-form"
                    unitOfMeasure={crud.selectedItem}
                    isSubmitting={isPending}
                    onSubmit={handleFormSubmit}
                />
            </FormModal>

            <DeleteConfirmDialog
                isOpen={crud.isDeleteOpen}
                itemName={
                    crud.selectedItem
                        ? `${crud.selectedItem.name} (${crud.selectedItem.symbol})`
                        : undefined
                }
                isDeleting={deleteUnit.isPending}
                onClose={crud.closeAll}
                onConfirm={handleDeleteConfirm}
            />
        </>
    )
}

export default UnitsOfMeasureView
