import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    useAdjustment,
    useAdjustmentItems,
    useUpdateAdjustment,
    useDeleteAdjustment,
    useConfirmAdjustment,
    useCancelAdjustment,
    useDeleteAdjustmentItem,
} from '@/hooks/useAdjustments'
import { useWarehouses } from '@/hooks/useWarehouses'
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
    ADJUSTMENT_STATUS_LABELS,
    ADJUSTMENT_STATUS_CLASSES,
    ADJUSTMENT_REASON_LABELS,
    type AdjustmentItem,
    type AdjustmentUpdateInput,
} from '@/services/AdjustmentService'
import AdjustmentItemForm from './AdjustmentItemForm'
import {
    HiOutlineArrowLeft,
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineCheck,
    HiOutlineX,
} from 'react-icons/hi'

const { Tr, Th, Td, THead, TBody } = Table

const AdjustmentDetailView = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const adjustmentId = parseInt(id || '0')

    const { data: adjustment, isLoading: adjustmentLoading } =
        useAdjustment(adjustmentId)
    const { data: items = [], isLoading: itemsLoading } =
        useAdjustmentItems(adjustmentId)

    const { data: warehousesData } = useWarehouses({ limit: 100 })
    const warehouses = warehousesData?.items ?? []

    const { data: productsData } = useProducts()
    const products = productsData?.items ?? []

    const warehouseId = adjustment?.warehouseId ?? 0
    const { data: locationsData } = useLocations(
        warehouseId ? { warehouseId, limit: 100 } : undefined
    )
    const locations = locationsData?.items ?? []

    const updateAdjustment = useUpdateAdjustment()
    const deleteAdjustment = useDeleteAdjustment()
    const confirmAdjustment = useConfirmAdjustment()
    const cancelAdjustment = useCancelAdjustment()
    const deleteItem = useDeleteAdjustmentItem()

    const isDraft = adjustment?.status === 'draft'

    // Edit adjustment state
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editData, setEditData] = useState<AdjustmentUpdateInput>({
        notes: '',
        adjustedBy: '',
    })

    // Item form state
    const [itemFormOpen, setItemFormOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<AdjustmentItem | null>(
        null
    )

    // Confirm/Cancel/Delete dialogs
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteItemDialog, setDeleteItemDialog] = useState<{
        open: boolean
        item: AdjustmentItem | null
    }>({ open: false, item: null })

    const getWarehouseName = (wId: number) => {
        const w = warehouses.find((w) => w.id === wId)
        return w ? `${w.name} (${w.code})` : `#${wId}`
    }

    const getProductName = (productId: number) => {
        const p = products.find((p) => p.id === productId)
        return p ? `${p.name} (${p.sku})` : `#${productId}`
    }

    const getLocationName = (locationId: number) => {
        const l = locations.find((l) => l.id === locationId)
        return l ? `${l.name} (${l.code})` : `#${locationId}`
    }

    const getDifferenceColor = (diff: number) => {
        if (diff > 0) return 'text-emerald-600 dark:text-emerald-400'
        if (diff < 0) return 'text-red-600 dark:text-red-400'
        return 'text-gray-500'
    }

    const getDifferenceLabel = (diff: number) => {
        if (diff > 0) return `+${diff}`
        return diff.toString()
    }

    // Handlers
    const handleEditAdjustment = () => {
        if (adjustment) {
            setEditData({
                notes: adjustment.notes || '',
                adjustedBy: adjustment.adjustedBy || '',
            })
            setEditDialogOpen(true)
        }
    }

    const handleSaveEdit = async () => {
        try {
            await updateAdjustment.mutateAsync({
                id: adjustmentId,
                data: {
                    notes: editData.notes || undefined,
                    adjustedBy: editData.adjustedBy || undefined,
                },
            })
            toast.push(
                <Notification title="Ajuste actualizado" type="success">
                    El ajuste se actualizó correctamente
                </Notification>,
                { placement: 'top-center' }
            )
            setEditDialogOpen(false)
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al actualizar el ajuste')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const handleConfirm = async () => {
        try {
            await confirmAdjustment.mutateAsync(adjustmentId)
            toast.push(
                <Notification title="Ajuste confirmado" type="success">
                    El ajuste se confirmó y los movimientos de inventario fueron
                    generados
                </Notification>,
                { placement: 'top-center' }
            )
            setConfirmDialogOpen(false)
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al confirmar el ajuste')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const handleCancel = async () => {
        try {
            await cancelAdjustment.mutateAsync(adjustmentId)
            toast.push(
                <Notification title="Ajuste cancelado" type="success">
                    El ajuste fue cancelado
                </Notification>,
                { placement: 'top-center' }
            )
            setCancelDialogOpen(false)
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al cancelar el ajuste')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const handleDelete = async () => {
        try {
            await deleteAdjustment.mutateAsync(adjustmentId)
            toast.push(
                <Notification title="Ajuste eliminado" type="success">
                    El ajuste fue eliminado
                </Notification>,
                { placement: 'top-center' }
            )
            navigate('/adjustments')
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al eliminar el ajuste')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const handleDeleteItemConfirm = async () => {
        if (!deleteItemDialog.item) return
        try {
            await deleteItem.mutateAsync({
                itemId: deleteItemDialog.item.id,
                adjustmentId,
            })
            toast.push(
                <Notification title="Item eliminado" type="success">
                    El item fue eliminado
                </Notification>,
                { placement: 'top-center' }
            )
            setDeleteItemDialog({ open: false, item: null })
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al eliminar el item')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const handleAddItem = () => {
        setSelectedItem(null)
        setItemFormOpen(true)
    }

    const handleEditItem = (item: AdjustmentItem) => {
        setSelectedItem(item)
        setItemFormOpen(true)
    }

    const handleCloseItemForm = () => {
        setItemFormOpen(false)
        setSelectedItem(null)
    }

    // Items with difference != 0 for confirm summary
    const itemsWithDifference = items.filter((i) => i.difference !== 0)

    if (adjustmentLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div>Cargando...</div>
            </div>
        )
    }

    if (!adjustment) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <h4 className="mb-4">Ajuste no encontrado</h4>
                <Button
                    variant="solid"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/adjustments')}
                >
                    Volver a Ajustes
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
                        onClick={() => navigate('/adjustments')}
                    />
                    <h3>Ajuste #{adjustment.id}</h3>
                    <Badge
                        content={ADJUSTMENT_STATUS_LABELS[adjustment.status]}
                        className={ADJUSTMENT_STATUS_CLASSES[adjustment.status]}
                    />
                </div>
                {isDraft && (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<HiOutlinePencil />}
                            onClick={handleEditAdjustment}
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
                            icon={<HiOutlineX />}
                            onClick={() => setCancelDialogOpen(true)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<HiOutlineTrash />}
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            Eliminar
                        </Button>
                    </div>
                )}
            </div>

            {/* Adjustment Info */}
            <Card>
                <h5 className="mb-4">Información del Ajuste</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Almacén</p>
                        <p className="font-medium">
                            {getWarehouseName(adjustment.warehouseId)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Motivo</p>
                        <p className="font-medium">
                            {ADJUSTMENT_REASON_LABELS[adjustment.reason]}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Responsable</p>
                        <p className="font-medium">
                            {adjustment.adjustedBy || '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Fecha de Creación
                        </p>
                        <p className="font-medium">
                            {adjustment.createdAt
                                ? new Date(adjustment.createdAt).toLocaleString(
                                      'es-EC'
                                  )
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Fecha de Ajuste</p>
                        <p className="font-medium">
                            {adjustment.adjustmentDate
                                ? new Date(
                                      adjustment.adjustmentDate
                                  ).toLocaleString('es-EC')
                                : '-'}
                        </p>
                    </div>
                </div>
                {adjustment.notes && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Notas</p>
                        <p className="font-medium">{adjustment.notes}</p>
                    </div>
                )}
            </Card>

            {/* Items */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h5>Items del Ajuste ({items.length})</h5>
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
                        No hay items en este ajuste
                    </div>
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Producto</Th>
                                <Th>Ubicación</Th>
                                <Th>Esperado</Th>
                                <Th>Actual</Th>
                                <Th>Diferencia</Th>
                                <Th>Lote</Th>
                                <Th>Notas</Th>
                                {isDraft && <Th>Acciones</Th>}
                            </Tr>
                        </THead>
                        <TBody>
                            {items.map((item) => (
                                <Tr key={item.id}>
                                    <Td>{getProductName(item.productId)}</Td>
                                    <Td>{getLocationName(item.locationId)}</Td>
                                    <Td>{item.expectedQuantity}</Td>
                                    <Td>{item.actualQuantity}</Td>
                                    <Td>
                                        <span
                                            className={`font-semibold ${getDifferenceColor(
                                                item.difference
                                            )}`}
                                        >
                                            {getDifferenceLabel(
                                                item.difference
                                            )}
                                        </span>
                                    </Td>
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
            <AdjustmentItemForm
                adjustmentId={adjustmentId}
                item={selectedItem}
                open={itemFormOpen}
                warehouseId={adjustment.warehouseId}
                onClose={handleCloseItemForm}
            />

            {/* Edit Adjustment Dialog */}
            <Dialog
                isOpen={editDialogOpen}
                width={500}
                onClose={() => setEditDialogOpen(false)}
                onRequestClose={() => setEditDialogOpen(false)}
            >
                <h5 className="mb-4">Editar Ajuste</h5>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Responsable
                        </label>
                        <Input
                            type="text"
                            placeholder="Nombre del responsable"
                            value={editData.adjustedBy || ''}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    adjustedBy: e.target.value,
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
                        loading={updateAdjustment.isPending}
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
                <h5 className="mb-4">Confirmar Ajuste</h5>
                <p className="mb-4">
                    ¿Está seguro que desea confirmar este ajuste? Se generarán
                    movimientos de inventario automáticos.
                </p>
                {itemsWithDifference.length > 0 ? (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium mb-2">
                            Movimientos que se generarán:
                        </p>
                        <ul className="text-sm space-y-1">
                            {itemsWithDifference.map((item) => (
                                <li key={item.id}>
                                    <span className="font-medium">
                                        {getProductName(item.productId)}
                                    </span>
                                    :{' '}
                                    <span
                                        className={getDifferenceColor(
                                            item.difference
                                        )}
                                    >
                                        {item.difference > 0
                                            ? `+${item.difference} (entrada)`
                                            : `${item.difference} (salida)`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="mb-4 text-sm text-gray-500">
                        No se generarán movimientos (todas las diferencias son
                        0).
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
                        loading={confirmAdjustment.isPending}
                        onClick={handleConfirm}
                    >
                        Confirmar
                    </Button>
                </div>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog
                isOpen={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                onRequestClose={() => setCancelDialogOpen(false)}
            >
                <h5 className="mb-4">Cancelar Ajuste</h5>
                <p className="mb-6">
                    ¿Está seguro que desea cancelar este ajuste? No se generarán
                    movimientos de inventario.
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
                        loading={cancelAdjustment.isPending}
                        onClick={handleCancel}
                    >
                        Cancelar Ajuste
                    </Button>
                </div>
            </Dialog>

            {/* Delete Adjustment Dialog */}
            <Dialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onRequestClose={() => setDeleteDialogOpen(false)}
            >
                <h5 className="mb-4">Eliminar Ajuste</h5>
                <p className="mb-6">
                    ¿Está seguro que desea eliminar este ajuste? Esta acción no
                    se puede deshacer.
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
                        loading={deleteAdjustment.isPending}
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
                    ¿Está seguro que desea eliminar este item del ajuste? Esta
                    acción no se puede deshacer.
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

export default AdjustmentDetailView
