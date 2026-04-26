import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    useTransfer,
    useTransferItems,
    useUpdateTransfer,
    useDeleteTransfer,
    useConfirmTransfer,
    useReceiveTransfer,
    useCancelTransfer,
    useDeleteTransferItem,
} from '@/hooks/useTransfers'
import { useProducts } from '@/hooks/useProducts'
import { useLocations } from '@/hooks/useLocations'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { getErrorMessage } from '@/utils/getErrorMessage'
import {
    TRANSFER_STATUS_LABELS,
    TRANSFER_STATUS_CLASSES,
    type TransferItem,
    type TransferUpdateInput,
} from '@/services/TransferService'
import TransferItemForm from './TransferItemForm'
import {
    HiOutlineArrowLeft,
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineCheck,
    HiOutlineX,
} from 'react-icons/hi'

const { Tr, Th, Td, THead, TBody } = Table

const TransferDetailView = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const transferId = parseInt(id || '0')

    const { data: transfer, isLoading: transferLoading } =
        useTransfer(transferId)
    const { data: items = [], isLoading: itemsLoading } =
        useTransferItems(transferId)

    const { data: productsData } = useProducts()
    const products = productsData?.items ?? []

    const { data: locationsData } = useLocations({ limit: 100 })
    const locations = locationsData?.items ?? []

    const updateTransfer = useUpdateTransfer()
    const deleteTransfer = useDeleteTransfer()
    const confirmTransfer = useConfirmTransfer()
    const receiveTransfer = useReceiveTransfer()
    const cancelTransfer = useCancelTransfer()
    const deleteItem = useDeleteTransferItem()

    const isDraft = transfer?.status === 'draft'
    const isConfirmed = transfer?.status === 'confirmed'
    const canCancel = isDraft || isConfirmed

    // Edit transfer state
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editData, setEditData] = useState<TransferUpdateInput>({
        notes: '',
        requestedBy: '',
    })

    // Item form state
    const [itemFormOpen, setItemFormOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<TransferItem | null>(null)

    // Confirm/Receive/Cancel/Delete dialogs
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteItemDialog, setDeleteItemDialog] = useState<{
        open: boolean
        item: TransferItem | null
    }>({ open: false, item: null })

    const getLocationName = (locationId: number) => {
        const l = locations.find((l) => l.id === locationId)
        return l ? `${l.name} (${l.code})` : `#${locationId}`
    }

    const getProductName = (productId: number) => {
        const p = products.find((p) => p.id === productId)
        return p ? `${p.name} (${p.sku})` : `#${productId}`
    }

    // Handlers
    const handleEditTransfer = () => {
        if (transfer) {
            setEditData({
                notes: transfer.notes || '',
                requestedBy: transfer.requestedBy || '',
            })
            setEditDialogOpen(true)
        }
    }

    const handleSaveEdit = async () => {
        try {
            await updateTransfer.mutateAsync({
                id: transferId,
                data: {
                    notes: editData.notes || undefined,
                    requestedBy: editData.requestedBy || undefined,
                },
            })
            toast.push(
                <Notification title="Transferencia actualizada" type="success">
                    La transferencia se actualizó correctamente
                </Notification>,
                { placement: 'top-end' }
            )
            setEditDialogOpen(false)
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(
                        error,
                        'Error al actualizar la transferencia'
                    )}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const handleConfirm = async () => {
        try {
            await confirmTransfer.mutateAsync(transferId)
            toast.push(
                <Notification title="Transferencia confirmada" type="success">
                    La transferencia se confirmó y el stock fue reservado
                </Notification>,
                { placement: 'top-end' }
            )
            setConfirmDialogOpen(false)
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(
                        error,
                        'Error al confirmar la transferencia'
                    )}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const handleReceive = async () => {
        try {
            await receiveTransfer.mutateAsync(transferId)
            toast.push(
                <Notification title="Transferencia recibida" type="success">
                    La transferencia se completó y los movimientos fueron
                    generados
                </Notification>,
                { placement: 'top-end' }
            )
            setReceiveDialogOpen(false)
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(
                        error,
                        'Error al recibir la transferencia'
                    )}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const handleCancel = async () => {
        try {
            await cancelTransfer.mutateAsync(transferId)
            toast.push(
                <Notification title="Transferencia cancelada" type="success">
                    La transferencia fue cancelada
                </Notification>,
                { placement: 'top-end' }
            )
            setCancelDialogOpen(false)
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(
                        error,
                        'Error al cancelar la transferencia'
                    )}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const handleDelete = async () => {
        try {
            await deleteTransfer.mutateAsync(transferId)
            toast.push(
                <Notification title="Transferencia eliminada" type="success">
                    La transferencia fue eliminada
                </Notification>,
                { placement: 'top-end' }
            )
            navigate('/transfers')
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(
                        error,
                        'Error al eliminar la transferencia'
                    )}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const handleDeleteItemConfirm = async () => {
        if (!deleteItemDialog.item) return
        try {
            await deleteItem.mutateAsync({
                itemId: deleteItemDialog.item.id,
                transferId,
            })
            toast.push(
                <Notification title="Item eliminado" type="success">
                    El item fue eliminado
                </Notification>,
                { placement: 'top-end' }
            )
            setDeleteItemDialog({ open: false, item: null })
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al eliminar el item')}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const handleAddItem = () => {
        setSelectedItem(null)
        setItemFormOpen(true)
    }

    const handleEditItem = (item: TransferItem) => {
        setSelectedItem(item)
        setItemFormOpen(true)
    }

    const handleCloseItemForm = () => {
        setItemFormOpen(false)
        setSelectedItem(null)
    }

    if (transferLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div>Cargando...</div>
            </div>
        )
    }

    if (!transfer) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <h4 className="mb-4">Transferencia no encontrada</h4>
                <Button
                    variant="solid"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/transfers')}
                >
                    Volver a Transferencias
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/transfers')}
                    />
                    <h3>Transferencia #{transfer.id}</h3>
                    <Badge
                        content={TRANSFER_STATUS_LABELS[transfer.status]}
                        className={TRANSFER_STATUS_CLASSES[transfer.status]}
                    />
                </div>
                <div className="flex gap-2">
                    {isDraft && (
                        <>
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<HiOutlinePencil />}
                                onClick={handleEditTransfer}
                            >
                                Editar
                            </Button>
                            <Button
                                size="sm"
                                variant="solid"
                                color="emerald-600"
                                icon={<HiOutlineCheck />}
                                onClick={() => setConfirmDialogOpen(true)}
                            >
                                Confirmar
                            </Button>
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<HiOutlineTrash />}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Eliminar
                            </Button>
                        </>
                    )}
                    {isConfirmed && (
                        <Button
                            size="sm"
                            variant="solid"
                            color="emerald-600"
                            icon={<HiOutlineCheck />}
                            onClick={() => setReceiveDialogOpen(true)}
                        >
                            Recibir
                        </Button>
                    )}
                    {canCancel && (
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<HiOutlineX />}
                            onClick={() => setCancelDialogOpen(true)}
                        >
                            Cancelar
                        </Button>
                    )}
                </div>
            </div>

            {/* Transfer Info */}
            <Card>
                <h5 className="mb-4">Información de la Transferencia</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">
                            Ubicación Origen
                        </p>
                        <p className="font-medium">
                            {getLocationName(transfer.sourceLocationId)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Ubicación Destino
                        </p>
                        <p className="font-medium">
                            {getLocationName(transfer.destinationLocationId)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Solicitado por</p>
                        <p className="font-medium">
                            {transfer.requestedBy || '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Fecha de Creación
                        </p>
                        <p className="font-medium">
                            {transfer.createdAt
                                ? new Date(transfer.createdAt).toLocaleString(
                                      'es-EC'
                                  )
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Fecha de Transferencia
                        </p>
                        <p className="font-medium">
                            {transfer.transferDate
                                ? new Date(
                                      transfer.transferDate
                                  ).toLocaleString('es-EC')
                                : '-'}
                        </p>
                    </div>
                </div>
                {transfer.notes && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Notas</p>
                        <p className="font-medium">{transfer.notes}</p>
                    </div>
                )}
            </Card>

            {/* Items */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h5>Items de la Transferencia ({items.length})</h5>
                    {isDraft && (
                        <Button
                            size="sm"
                            variant="solid"
                            icon={<HiOutlinePlus />}
                            onClick={handleAddItem}
                        >
                            Agregar Item
                        </Button>
                    )}
                </div>

                {itemsLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <div>Cargando items...</div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No hay items en esta transferencia
                    </div>
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Producto</Th>
                                <Th>Cantidad</Th>
                                <Th>Lote</Th>
                                <Th>Notas</Th>
                                {isDraft && <Th>Acciones</Th>}
                            </Tr>
                        </THead>
                        <TBody>
                            {items.map((item) => (
                                <Tr key={item.id}>
                                    <Td>{getProductName(item.productId)}</Td>
                                    <Td>{item.quantity}</Td>
                                    <Td>
                                        {item.lotId ? `#${item.lotId}` : '-'}
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.notes || '-'}
                                        </span>
                                    </Td>
                                    {isDraft && (
                                        <Td>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    icon={<HiOutlinePencil />}
                                                    onClick={() =>
                                                        handleEditItem(item)
                                                    }
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    icon={<HiOutlineTrash />}
                                                    onClick={() =>
                                                        setDeleteItemDialog({
                                                            open: true,
                                                            item,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </Td>
                                    )}
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                )}
            </Card>

            {/* Item Form Modal */}
            <TransferItemForm
                transferId={transferId}
                item={selectedItem}
                open={itemFormOpen}
                onClose={handleCloseItemForm}
            />

            {/* Edit Transfer Dialog */}
            <Dialog
                isOpen={editDialogOpen}
                width={500}
                onClose={() => setEditDialogOpen(false)}
                onRequestClose={() => setEditDialogOpen(false)}
            >
                <h5 className="mb-4">Editar Transferencia</h5>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Solicitado por
                        </label>
                        <Input
                            type="text"
                            placeholder="Nombre del solicitante"
                            value={editData.requestedBy || ''}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    requestedBy: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Notas
                        </label>
                        <Input
                            textArea
                            placeholder="Observaciones"
                            value={editData.notes || ''}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    notes: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        variant="plain"
                        onClick={() => setEditDialogOpen(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={updateTransfer.isPending}
                        onClick={handleSaveEdit}
                    >
                        Guardar
                    </Button>
                </div>
            </Dialog>

            {/* Confirm Dialog */}
            <Dialog
                isOpen={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onRequestClose={() => setConfirmDialogOpen(false)}
            >
                <h5 className="mb-4">Confirmar Transferencia</h5>
                <p className="mb-4">
                    ¿Está seguro que desea confirmar esta transferencia? Se
                    reservará el stock en la ubicación de origen.
                </p>
                {items.length > 0 ? (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium mb-2">
                            Items a transferir:
                        </p>
                        <ul className="text-sm space-y-1">
                            {items.map((item) => (
                                <li key={item.id}>
                                    <span className="font-medium">
                                        {getProductName(item.productId)}
                                    </span>
                                    :{' '}
                                    <span className="text-blue-600 dark:text-blue-400">
                                        {item.quantity} unidades
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="mb-4 text-sm text-red-500">
                        No se puede confirmar una transferencia sin items.
                    </p>
                )}
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        onClick={() => setConfirmDialogOpen(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={confirmTransfer.isPending}
                        disabled={items.length === 0}
                        onClick={handleConfirm}
                    >
                        Confirmar
                    </Button>
                </div>
            </Dialog>

            {/* Receive Dialog */}
            <Dialog
                isOpen={receiveDialogOpen}
                onClose={() => setReceiveDialogOpen(false)}
                onRequestClose={() => setReceiveDialogOpen(false)}
            >
                <h5 className="mb-4">Recibir Transferencia</h5>
                <p className="mb-4">
                    ¿Está seguro que desea marcar esta transferencia como
                    recibida? Se generarán los movimientos de inventario (salida
                    del origen y entrada al destino).
                </p>
                {items.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium mb-2">
                            Movimientos que se generarán:
                        </p>
                        <ul className="text-sm space-y-1">
                            {items.map((item) => (
                                <li key={item.id}>
                                    <span className="font-medium">
                                        {getProductName(item.productId)}
                                    </span>
                                    :{' '}
                                    <span className="text-red-600 dark:text-red-400">
                                        -{item.quantity} (origen)
                                    </span>
                                    {' / '}
                                    <span className="text-emerald-600 dark:text-emerald-400">
                                        +{item.quantity} (destino)
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        onClick={() => setReceiveDialogOpen(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={receiveTransfer.isPending}
                        onClick={handleReceive}
                    >
                        Recibir
                    </Button>
                </div>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog
                isOpen={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                onRequestClose={() => setCancelDialogOpen(false)}
            >
                <h5 className="mb-4">Cancelar Transferencia</h5>
                <p className="mb-6">
                    ¿Está seguro que desea cancelar esta transferencia?
                    {isConfirmed &&
                        ' Se liberarán las reservas de stock en la ubicación de origen.'}
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        onClick={() => setCancelDialogOpen(false)}
                    >
                        Volver
                    </Button>
                    <Button
                        variant="solid"
                        loading={cancelTransfer.isPending}
                        onClick={handleCancel}
                    >
                        Cancelar Transferencia
                    </Button>
                </div>
            </Dialog>

            {/* Delete Transfer Dialog */}
            <Dialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onRequestClose={() => setDeleteDialogOpen(false)}
            >
                <h5 className="mb-4">Eliminar Transferencia</h5>
                <p className="mb-6">
                    ¿Está seguro que desea eliminar esta transferencia? Esta
                    acción no se puede deshacer.
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        onClick={() => setDeleteDialogOpen(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={deleteTransfer.isPending}
                        onClick={handleDelete}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>

            {/* Delete Item Dialog */}
            <Dialog
                isOpen={deleteItemDialog.open}
                onClose={() => setDeleteItemDialog({ open: false, item: null })}
                onRequestClose={() =>
                    setDeleteItemDialog({ open: false, item: null })
                }
            >
                <h5 className="mb-4">Eliminar Item</h5>
                <p className="mb-6">
                    ¿Está seguro que desea eliminar este item de la
                    transferencia? Esta acción no se puede deshacer.
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        onClick={() =>
                            setDeleteItemDialog({ open: false, item: null })
                        }
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={deleteItem.isPending}
                        onClick={handleDeleteItemConfirm}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default TransferDetailView
