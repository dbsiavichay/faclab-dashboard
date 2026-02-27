import { useState } from 'react'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Badge from '@/components/ui/Badge'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useLocations, useDeleteLocation } from '@/hooks/useLocations'
import { useWarehouses } from '@/hooks/useWarehouses'
import type { Location } from '@/services/LocationService'
import LocationForm from './LocationForm'
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi'

const LOCATION_TYPE_LABELS: Record<string, string> = {
    STORAGE: 'Almacenamiento',
    RECEIVING: 'Recepción',
    SHIPPING: 'Despacho',
    RETURN: 'Devolución',
}

const LocationsView = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(
        null
    )
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean
        location: Location | null
    }>({ open: false, location: null })

    const { data: locations = [], isLoading } = useLocations()
    const { data: warehouses = [] } = useWarehouses()
    const deleteLocation = useDeleteLocation()

    const warehouseMap = new Map(warehouses.map((w) => [w.id, w.name]))

    const handleCreate = () => {
        setSelectedLocation(null)
        setIsFormOpen(true)
    }

    const handleEdit = (location: Location) => {
        setSelectedLocation(location)
        setIsFormOpen(true)
    }

    const handleDeleteClick = (location: Location) => {
        setDeleteDialog({ open: true, location })
    }

    const handleDeleteConfirm = async () => {
        if (deleteDialog.location) {
            try {
                await deleteLocation.mutateAsync(deleteDialog.location.id)
                toast.push(
                    <Notification title="Ubicación eliminada" type="success">
                        La ubicación se eliminó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
                setDeleteDialog({ open: false, location: null })
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    'Error al eliminar la ubicación'

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
        setSelectedLocation(null)
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
                            onClick={handleCreate}
                        >
                            Nueva Ubicación
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={locations}
                        loading={isLoading}
                    />
                </div>
            </Card>

            <LocationForm
                open={isFormOpen}
                location={selectedLocation}
                onClose={handleFormClose}
            />

            <Dialog
                isOpen={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, location: null })}
                onRequestClose={() =>
                    setDeleteDialog({ open: false, location: null })
                }
            >
                <h5 className="mb-4">Confirmar Eliminación</h5>
                <p className="mb-6">
                    ¿Estás seguro de que deseas eliminar la ubicación{' '}
                    <strong>
                        {deleteDialog.location?.name} (
                        {deleteDialog.location?.code})
                    </strong>
                    ? Esta acción no se puede deshacer.
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        disabled={deleteLocation.isPending}
                        onClick={() =>
                            setDeleteDialog({ open: false, location: null })
                        }
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={deleteLocation.isPending}
                        onClick={handleDeleteConfirm}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default LocationsView
