import { useState } from 'react'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Badge from '@/components/ui/Badge'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useWarehouses, useDeleteWarehouse } from '@/hooks/useWarehouses'
import type { Warehouse } from '@/services/WarehouseService'
import WarehouseForm from './WarehouseForm'
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi'

const WarehousesView = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedWarehouse, setSelectedWarehouse] =
        useState<Warehouse | null>(null)
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean
        warehouse: Warehouse | null
    }>({ open: false, warehouse: null })

    const { data: warehouses = [], isLoading } = useWarehouses()
    const deleteWarehouse = useDeleteWarehouse()

    const handleCreate = () => {
        setSelectedWarehouse(null)
        setIsFormOpen(true)
    }

    const handleEdit = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse)
        setIsFormOpen(true)
    }

    const handleDeleteClick = (warehouse: Warehouse) => {
        setDeleteDialog({ open: true, warehouse })
    }

    const handleDeleteConfirm = async () => {
        if (deleteDialog.warehouse) {
            try {
                await deleteWarehouse.mutateAsync(deleteDialog.warehouse.id)
                toast.push(
                    <Notification title="Bodega eliminada" type="success">
                        La bodega se eliminó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
                setDeleteDialog({ open: false, warehouse: null })
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    'Error al eliminar la bodega'

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
        setSelectedWarehouse(null)
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
                            <h4 className="text-lg font-semibold">Bodegas</h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestiona las bodegas de almacenamiento
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlus />}
                            onClick={handleCreate}
                        >
                            Nueva Bodega
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={warehouses}
                        loading={isLoading}
                    />
                </div>
            </Card>

            <WarehouseForm
                open={isFormOpen}
                warehouse={selectedWarehouse}
                onClose={handleFormClose}
            />

            <Dialog
                isOpen={deleteDialog.open}
                onClose={() =>
                    setDeleteDialog({ open: false, warehouse: null })
                }
                onRequestClose={() =>
                    setDeleteDialog({ open: false, warehouse: null })
                }
            >
                <h5 className="mb-4">Confirmar Eliminación</h5>
                <p className="mb-6">
                    ¿Estás seguro de que deseas eliminar la bodega{' '}
                    <strong>
                        {deleteDialog.warehouse?.name} (
                        {deleteDialog.warehouse?.code})
                    </strong>
                    ? Esta acción no se puede deshacer.
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        disabled={deleteWarehouse.isPending}
                        onClick={() =>
                            setDeleteDialog({ open: false, warehouse: null })
                        }
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={deleteWarehouse.isPending}
                        onClick={handleDeleteConfirm}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default WarehousesView
