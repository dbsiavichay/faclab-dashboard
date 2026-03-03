import { useState } from 'react'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    useSerialNumbers,
    useDeleteSerialNumber,
} from '@/hooks/useSerialNumbers'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type {
    SerialNumber,
    SerialStatus,
    SerialNumberQueryParams,
} from '@/services/SerialNumberService'
import { SERIAL_STATUS_LABELS } from '@/services/SerialNumberService'
import SerialNumberForm from './SerialNumberForm'
import StatusChangeDialog from './StatusChangeDialog'
import {
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineRefresh,
    HiPlus,
} from 'react-icons/hi'

const STATUS_BADGE_CLASSES: Record<SerialStatus, string> = {
    AVAILABLE:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    RESERVED:
        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    SOLD: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
    IN_TRANSIT:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    DEFECTIVE: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
    RETURNED:
        'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
}

const statusFilterOptions = [
    { value: '', label: 'Todos los estados' },
    ...(Object.keys(SERIAL_STATUS_LABELS) as SerialStatus[]).map((key) => ({
        value: key,
        label: SERIAL_STATUS_LABELS[key],
    })),
]

const SerialNumbersView = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedSerial, setSelectedSerial] = useState<SerialNumber | null>(
        null
    )
    const [statusChangeSerial, setStatusChangeSerial] =
        useState<SerialNumber | null>(null)
    const [statusChangeOpen, setStatusChangeOpen] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean
        serial: SerialNumber | null
    }>({ open: false, serial: null })

    const [productId, setProductId] = useState<string>('')
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [lotId, setLotId] = useState<string>('')
    const [locationId, setLocationId] = useState<string>('')

    const queryParams: SerialNumberQueryParams = {
        productId: productId ? parseInt(productId) : undefined,
        status: (statusFilter as SerialStatus) || undefined,
        lotId: lotId ? parseInt(lotId) : undefined,
        locationId: locationId ? parseInt(locationId) : undefined,
    }

    const { data: serials = [], isLoading } = useSerialNumbers(queryParams)
    const deleteSerial = useDeleteSerialNumber()

    const handleCreate = () => {
        setSelectedSerial(null)
        setIsFormOpen(true)
    }

    const handleEdit = (serial: SerialNumber) => {
        setSelectedSerial(serial)
        setIsFormOpen(true)
    }

    const handleStatusChange = (serial: SerialNumber) => {
        setStatusChangeSerial(serial)
        setStatusChangeOpen(true)
    }

    const handleDeleteClick = (serial: SerialNumber) => {
        setDeleteDialog({ open: true, serial })
    }

    const handleDeleteConfirm = async () => {
        if (deleteDialog.serial) {
            try {
                await deleteSerial.mutateAsync(deleteDialog.serial.id)
                toast.push(
                    <Notification
                        title="Número de serie eliminado"
                        type="success"
                    >
                        El número de serie se eliminó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
                setDeleteDialog({ open: false, serial: null })
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(
                    error,
                    'Error al eliminar el número de serie'
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
        setSelectedSerial(null)
    }

    const handleStatusChangeClose = () => {
        setStatusChangeOpen(false)
        setStatusChangeSerial(null)
    }

    const handleReset = () => {
        setProductId('')
        setStatusFilter('')
        setLotId('')
        setLocationId('')
    }

    const columns: ColumnDef<SerialNumber>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
            cell: (props) => {
                const { row } = props
                return <span className="font-medium">#{row.original.id}</span>
            },
        },
        {
            header: 'Número de Serie',
            accessorKey: 'serialNumber',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="font-mono text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {row.original.serialNumber}
                    </span>
                )
            },
        },
        {
            header: 'Producto ID',
            accessorKey: 'productId',
        },
        {
            header: 'Estado',
            accessorKey: 'status',
            cell: (props) => {
                const { row } = props
                const status = row.original.status
                return (
                    <Badge
                        content={SERIAL_STATUS_LABELS[status]}
                        className={STATUS_BADGE_CLASSES[status]}
                    />
                )
            },
        },
        {
            header: 'Lote ID',
            accessorKey: 'lotId',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {row.original.lotId || '-'}
                    </span>
                )
            },
        },
        {
            header: 'Ubicación ID',
            accessorKey: 'locationId',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {row.original.locationId || '-'}
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
                            title="Cambiar estado"
                            icon={<HiOutlineRefresh />}
                            onClick={() => handleStatusChange(row.original)}
                        />
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
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                                Estado
                            </label>
                            <Select
                                options={statusFilterOptions}
                                value={statusFilterOptions.find(
                                    (o) => o.value === statusFilter
                                )}
                                onChange={(option) =>
                                    setStatusFilter(
                                        (option as { value: string })?.value ||
                                            ''
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                ID Lote
                            </label>
                            <Input
                                type="number"
                                placeholder="Filtrar por lote"
                                value={lotId}
                                onChange={(e) => setLotId(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                ID Ubicación
                            </label>
                            <Input
                                type="number"
                                placeholder="Filtrar por ubicación"
                                value={locationId}
                                onChange={(e) => setLocationId(e.target.value)}
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
                            <h4 className="text-lg font-semibold">
                                Números de Serie
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestiona los números de serie de productos
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlus />}
                            onClick={handleCreate}
                        >
                            Nuevo Serial
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={serials}
                        loading={isLoading}
                    />
                </div>
            </Card>

            <SerialNumberForm
                open={isFormOpen}
                serialNumber={selectedSerial}
                onClose={handleFormClose}
            />

            <StatusChangeDialog
                open={statusChangeOpen}
                serialNumber={statusChangeSerial}
                onClose={handleStatusChangeClose}
            />

            <Dialog
                isOpen={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, serial: null })}
                onRequestClose={() =>
                    setDeleteDialog({ open: false, serial: null })
                }
            >
                <h5 className="mb-4">Confirmar Eliminación</h5>
                <p className="mb-6">
                    ¿Estás seguro de que deseas eliminar el número de serie{' '}
                    <strong>{deleteDialog.serial?.serialNumber}</strong>? Esta
                    acción no se puede deshacer.
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        disabled={deleteSerial.isPending}
                        onClick={() =>
                            setDeleteDialog({ open: false, serial: null })
                        }
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={deleteSerial.isPending}
                        onClick={handleDeleteConfirm}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default SerialNumbersView
