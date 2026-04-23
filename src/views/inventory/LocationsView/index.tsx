import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    useLocations,
    useDeleteLocation,
    useCreateLocation,
    useUpdateLocation,
} from '@/hooks/useLocations'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useWarehouses } from '@/hooks/useWarehouses'
import { useCrudOperations } from '@/hooks'
import { FormModal, DeleteConfirmDialog } from '@/components/shared'
import type { Location, LocationInput } from '@/services/LocationService'
import LocationForm from './LocationForm'
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi'

const LOCATION_TYPE_LABELS: Record<string, string> = {
    STORAGE: 'Almacenamiento',
    RECEIVING: 'Recepción',
    SHIPPING: 'Despacho',
    RETURN: 'Devolución',
}

const LocationsView = () => {
    const crud = useCrudOperations<Location>()
    const offset = (crud.pageIndex - 1) * crud.pageSize

    const { data, isLoading } = useLocations({ limit: crud.pageSize, offset })
    const locations = data?.items ?? []
    const total = data?.pagination?.total ?? 0

    const { data: warehousesData } = useWarehouses()
    const warehouses = warehousesData?.items ?? []
    const warehouseMap = new Map(warehouses.map((w) => [w.id, w.name]))

    const deleteLocation = useDeleteLocation()
    const createLocation = useCreateLocation()
    const updateLocation = useUpdateLocation()
    const isPending = createLocation.isPending || updateLocation.isPending

    const handleFormSubmit = async (formData: LocationInput) => {
        try {
            if (crud.isEditOpen && crud.selectedItem) {
                await updateLocation.mutateAsync({
                    id: crud.selectedItem.id,
                    data: formData,
                })
                toast.push(
                    <Notification title="Ubicación actualizada" type="success">
                        La ubicación se actualizó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
            } else {
                await createLocation.mutateAsync(formData)
                toast.push(
                    <Notification title="Ubicación creada" type="success">
                        La ubicación se creó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
            }
            crud.closeAll()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al guardar la ubicación')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const handleDeleteConfirm = async () => {
        if (!crud.selectedItem) return
        try {
            await deleteLocation.mutateAsync(crud.selectedItem.id)
            toast.push(
                <Notification title="Ubicación eliminada" type="success">
                    La ubicación se eliminó correctamente
                </Notification>,
                { placement: 'top-center' }
            )
            crud.closeAll()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al eliminar la ubicación')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const columns: ColumnDef<Location>[] = [
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
            header: 'Bodega',
            accessorKey: 'warehouseId',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="text-sm">
                        {warehouseMap.get(row.original.warehouseId) || '-'}
                    </span>
                )
            },
        },
        {
            header: 'Tipo',
            accessorKey: 'type',
            cell: (props) => {
                const { row } = props
                return (
                    <Badge
                        content={
                            LOCATION_TYPE_LABELS[row.original.type] ||
                            row.original.type
                        }
                        className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                    />
                )
            },
        },
        {
            header: 'Capacidad',
            accessorKey: 'capacity',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {row.original.capacity != null
                            ? row.original.capacity
                            : '-'}
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
                                Ubicaciones
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestiona las ubicaciones dentro de las bodegas
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlus />}
                            onClick={crud.openCreate}
                        >
                            Nueva Ubicación
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={locations}
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
                formId="location-form"
                isOpen={crud.isCreateOpen || crud.isEditOpen}
                title={crud.isEditOpen ? 'Editar Ubicación' : 'Nueva Ubicación'}
                isSubmitting={isPending}
                onClose={crud.closeAll}
            >
                <LocationForm
                    formId="location-form"
                    location={crud.selectedItem}
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
                isDeleting={deleteLocation.isPending}
                onClose={crud.closeAll}
                onConfirm={handleDeleteConfirm}
            />
        </>
    )
}

export default LocationsView
