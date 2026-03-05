import { useState } from 'react'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useLots, useDeleteLot } from '@/hooks/useLots'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { Lot, LotQueryParams } from '@/services/LotService'
import LotForm from './LotForm'
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi'

const LotsView = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedLot, setSelectedLot] = useState<Lot | null>(null)
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean
        lot: Lot | null
    }>({ open: false, lot: null })

    const [productId, setProductId] = useState<string>('')
    const [expiringInDays, setExpiringInDays] = useState<string>('')
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const offset = (pageIndex - 1) * pageSize

    const queryParams: LotQueryParams = {
        productId: productId ? parseInt(productId) : undefined,
        expiringInDays: expiringInDays ? parseInt(expiringInDays) : undefined,
        limit: pageSize,
        offset,
    }

    const { data, isLoading } = useLots(queryParams)
    const lots = data?.items ?? []
    const total = data?.pagination?.total ?? 0
    const deleteLot = useDeleteLot()

    const handleCreate = () => {
        setSelectedLot(null)
        setIsFormOpen(true)
    }

    const handleEdit = (lot: Lot) => {
        setSelectedLot(lot)
        setIsFormOpen(true)
    }

    const handleDeleteClick = (lot: Lot) => {
        setDeleteDialog({ open: true, lot })
    }

    const handleDeleteConfirm = async () => {
        if (deleteDialog.lot) {
            try {
                await deleteLot.mutateAsync(deleteDialog.lot.id)
                toast.push(
                    <Notification title="Lote eliminado" type="success">
                        El lote se eliminó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
                setDeleteDialog({ open: false, lot: null })
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(
                    error,
                    'Error al eliminar el lote'
                )

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
        setSelectedLot(null)
    }

    const handleReset = () => {
        setProductId('')
        setExpiringInDays('')
        setPageIndex(1)
    }

    const getExpiryBadge = (lot: Lot) => {
        if (lot.isExpired) {
            return (
                <Badge
                    content="Expirado"
                    className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                />
            )
        }
        if (
            lot.daysToExpiry !== null &&
            lot.daysToExpiry !== undefined &&
            lot.daysToExpiry <= 30
        ) {
            return (
                <Badge
                    content={`${lot.daysToExpiry} días`}
                    className="bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300"
                />
            )
        }
        if (lot.expirationDate) {
            return (
                <Badge
                    content="Vigente"
                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                />
            )
        }
        return (
            <span className="text-gray-400 italic text-sm">
                Sin vencimiento
            </span>
        )
    }

    const columns: ColumnDef<Lot>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
            cell: (props) => {
                const { row } = props
                return <span className="font-medium">#{row.original.id}</span>
            },
        },
        {
            header: 'Número de Lote',
            accessorKey: 'lotNumber',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="font-mono text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {row.original.lotNumber}
                    </span>
                )
            },
        },
        {
            header: 'Producto ID',
            accessorKey: 'productId',
        },
        {
            header: 'Cant. Inicial',
            accessorKey: 'initialQuantity',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="text-sm">
                        {row.original.initialQuantity}
                    </span>
                )
            },
        },
        {
            header: 'Cant. Actual',
            accessorKey: 'currentQuantity',
            cell: (props) => {
                const { row } = props
                const { currentQuantity, initialQuantity } = row.original
                return (
                    <span
                        className={`font-semibold ${
                            currentQuantity === 0
                                ? 'text-red-600'
                                : currentQuantity < initialQuantity * 0.2
                                ? 'text-yellow-600'
                                : 'text-green-600'
                        }`}
                    >
                        {currentQuantity}
                    </span>
                )
            },
        },
        {
            header: 'F. Manufactura',
            accessorKey: 'manufactureDate',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {row.original.manufactureDate || '-'}
                    </span>
                )
            },
        },
        {
            header: 'F. Vencimiento',
            accessorKey: 'expirationDate',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {row.original.expirationDate || '-'}
                    </span>
                )
            },
        },
        {
            header: 'Estado',
            id: 'status',
            cell: (props) => {
                const { row } = props
                return getExpiryBadge(row.original)
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
            <Card className="mb-4">
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                ID Producto
                            </label>
                            <Input
                                type="number"
                                placeholder="Filtrar por producto"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Por vencer en (días)
                            </label>
                            <Input
                                type="number"
                                min={1}
                                placeholder="Ej: 30"
                                value={expiringInDays}
                                onChange={(e) =>
                                    setExpiringInDays(e.target.value)
                                }
                            />
                        </div>
                        <div className="flex items-end">
                            <Button variant="plain" onClick={handleReset}>
                                Limpiar Filtros
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h4 className="text-lg font-semibold">Lotes</h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestiona los lotes de productos
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlus />}
                            onClick={handleCreate}
                        >
                            Nuevo Lote
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={lots}
                        loading={isLoading}
                        pagingData={{ total, pageIndex, pageSize }}
                        onPaginationChange={setPageIndex}
                        onSelectChange={(size) => {
                            setPageSize(size)
                            setPageIndex(1)
                        }}
                    />
                </div>
            </Card>

            <LotForm
                open={isFormOpen}
                lot={selectedLot}
                onClose={handleFormClose}
            />

            <Dialog
                isOpen={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, lot: null })}
                onRequestClose={() =>
                    setDeleteDialog({ open: false, lot: null })
                }
            >
                <h5 className="mb-4">Confirmar Eliminación</h5>
                <p className="mb-6">
                    ¿Estás seguro de que deseas eliminar el lote{' '}
                    <strong>{deleteDialog.lot?.lotNumber}</strong>? Esta acción
                    no se puede deshacer.
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        disabled={deleteLot.isPending}
                        onClick={() =>
                            setDeleteDialog({ open: false, lot: null })
                        }
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={deleteLot.isPending}
                        onClick={handleDeleteConfirm}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default LotsView
