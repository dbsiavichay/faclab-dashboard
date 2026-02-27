import { useState } from 'react'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Badge from '@/components/ui/Badge'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useUnitsOfMeasure, useDeleteUnitOfMeasure } from '@/hooks/useUnitsOfMeasure'
import type { UnitOfMeasure } from '@/services/UnitOfMeasureService'
import UnitOfMeasureForm from './UnitOfMeasureForm'
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi'

const UnitsOfMeasureView = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedUnit, setSelectedUnit] = useState<UnitOfMeasure | null>(null)
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean
        unit: UnitOfMeasure | null
    }>({ open: false, unit: null })

    const { data: units = [], isLoading } = useUnitsOfMeasure()
    const deleteUnit = useDeleteUnitOfMeasure()

    const handleCreate = () => {
        setSelectedUnit(null)
        setIsFormOpen(true)
    }

    const handleEdit = (unit: UnitOfMeasure) => {
        setSelectedUnit(unit)
        setIsFormOpen(true)
    }

    const handleDeleteClick = (unit: UnitOfMeasure) => {
        setDeleteDialog({ open: true, unit })
    }

    const handleDeleteConfirm = async () => {
        if (deleteDialog.unit) {
            try {
                await deleteUnit.mutateAsync(deleteDialog.unit.id)
                toast.push(
                    <Notification title="Unidad eliminada" type="success">
                        La unidad de medida se eliminó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
                setDeleteDialog({ open: false, unit: null })
            } catch (error: any) {
                const errorMessage = error.response?.data?.detail
                    || error.response?.data?.message
                    || 'Error al eliminar la unidad de medida'

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
        setSelectedUnit(null)
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
                return <span className="font-semibold">{row.original.name}</span>
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
                        className={row.original.isActive ? 'bg-emerald-500' : 'bg-gray-400'}
                    >
                        {row.original.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
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
                            onClick={handleCreate}
                        >
                            Nueva Unidad
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={units}
                        loading={isLoading}
                    />
                </div>
            </Card>

            <UnitOfMeasureForm
                open={isFormOpen}
                onClose={handleFormClose}
                unitOfMeasure={selectedUnit}
            />

            <Dialog
                isOpen={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, unit: null })}
                onRequestClose={() =>
                    setDeleteDialog({ open: false, unit: null })
                }
            >
                <h5 className="mb-4">Confirmar Eliminación</h5>
                <p className="mb-6">
                    ¿Estás seguro de que deseas eliminar la unidad{' '}
                    <strong>{deleteDialog.unit?.name} ({deleteDialog.unit?.symbol})</strong>?
                    Esta acción no se puede deshacer.
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        onClick={() =>
                            setDeleteDialog({ open: false, unit: null })
                        }
                        disabled={deleteUnit.isPending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        onClick={handleDeleteConfirm}
                        loading={deleteUnit.isPending}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default UnitsOfMeasureView
