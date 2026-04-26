import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    usePurchaseOrder,
    usePurchaseOrderItems,
    usePurchaseOrderReceipts,
    useUpdatePurchaseOrder,
    useDeletePurchaseOrder,
    useSendPurchaseOrder,
    useCancelPurchaseOrder,
    useDeletePurchaseOrderItem,
} from '@/hooks/usePurchaseOrders'
import { useProducts } from '@/hooks/useProducts'
import { useSuppliers } from '@/hooks/useSuppliers'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { getErrorMessage } from '@/utils/getErrorMessage'
import {
    PURCHASE_ORDER_STATUS_LABELS,
    PURCHASE_ORDER_STATUS_CLASSES,
    type PurchaseOrderItem,
    type PurchaseOrderUpdateInput,
} from '@/services/PurchaseOrderService'
import PurchaseOrderItemForm from './PurchaseOrderItemForm'
import ReceiveForm from './ReceiveForm'
import {
    HiOutlineArrowLeft,
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineX,
} from 'react-icons/hi'
import { HiOutlinePaperAirplane, HiOutlineArchiveBox } from 'react-icons/hi2'

const { Tr, Th, Td, THead, TBody, TFoot } = Table

const PurchaseOrderDetailView = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const orderId = parseInt(id || '0')

    const { data: order, isLoading: orderLoading } = usePurchaseOrder(orderId)
    const { data: items = [], isLoading: itemsLoading } =
        usePurchaseOrderItems(orderId)
    const { data: receipts = [] } = usePurchaseOrderReceipts(orderId)

    const { data: productsData } = useProducts()
    const products = productsData?.items ?? []

    const { data: suppliersData } = useSuppliers({ limit: 100 })
    const suppliers = suppliersData?.items ?? []

    const updateOrder = useUpdatePurchaseOrder()
    const deleteOrder = useDeletePurchaseOrder()
    const sendOrder = useSendPurchaseOrder()
    const cancelOrder = useCancelPurchaseOrder()
    const deleteItem = useDeletePurchaseOrderItem()

    const isDraft = order?.status === 'draft'
    const isSent = order?.status === 'sent'
    const isPartial = order?.status === 'partial'
    const canReceive = isSent || isPartial
    const canCancel = isDraft || isSent || isPartial

    // Edit order state
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editData, setEditData] = useState<
        PurchaseOrderUpdateInput & { supplierId: number }
    >({
        supplierId: 0,
        notes: '',
        expectedDate: '',
    })

    // Item form state
    const [itemFormOpen, setItemFormOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<PurchaseOrderItem | null>(
        null
    )

    // Receive form state
    const [receiveFormOpen, setReceiveFormOpen] = useState(false)

    // Confirmation dialogs
    const [sendDialogOpen, setSendDialogOpen] = useState(false)
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteItemDialog, setDeleteItemDialog] = useState<{
        open: boolean
        item: PurchaseOrderItem | null
    }>({ open: false, item: null })

    const supplierOptions = suppliers
        .filter((s) => s.isActive)
        .map((s) => ({
            value: s.id.toString(),
            label: s.name,
        }))

    const getProductName = (productId: number) => {
        const p = products.find((p) => p.id === productId)
        return p ? `${p.name} (${p.sku})` : `#${productId}`
    }

    const getSupplierName = (supplierId: number) => {
        const s = suppliers.find((s) => s.id === supplierId)
        return s ? s.name : `#${supplierId}`
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD',
        }).format(value)
    }

    // Handlers
    const handleEditOrder = () => {
        if (order) {
            setEditData({
                supplierId: order.supplierId,
                notes: order.notes || '',
                expectedDate: order.expectedDate
                    ? order.expectedDate.split('T')[0]
                    : '',
            })
            setEditDialogOpen(true)
        }
    }

    const handleSaveEdit = async () => {
        try {
            await updateOrder.mutateAsync({
                id: orderId,
                data: {
                    supplierId: editData.supplierId,
                    notes: editData.notes || undefined,
                    expectedDate: editData.expectedDate
                        ? `${editData.expectedDate}T00:00:00Z`
                        : undefined,
                },
            })
            toast.push(
                <Notification title="Orden actualizada" type="success">
                    La orden de compra se actualizó correctamente
                </Notification>,
                { placement: 'top-end' }
            )
            setEditDialogOpen(false)
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al actualizar la orden')}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const handleSend = async () => {
        try {
            await sendOrder.mutateAsync(orderId)
            toast.push(
                <Notification title="Orden enviada" type="success">
                    La orden de compra fue enviada al proveedor
                </Notification>,
                { placement: 'top-end' }
            )
            setSendDialogOpen(false)
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al enviar la orden')}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const handleCancel = async () => {
        try {
            await cancelOrder.mutateAsync(orderId)
            toast.push(
                <Notification title="Orden cancelada" type="success">
                    La orden de compra fue cancelada
                </Notification>,
                { placement: 'top-end' }
            )
            setCancelDialogOpen(false)
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al cancelar la orden')}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const handleDelete = async () => {
        try {
            await deleteOrder.mutateAsync(orderId)
            toast.push(
                <Notification title="Orden eliminada" type="success">
                    La orden de compra fue eliminada
                </Notification>,
                { placement: 'top-end' }
            )
            navigate('/purchase-orders')
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al eliminar la orden')}
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
                orderId,
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

    const handleEditItem = (item: PurchaseOrderItem) => {
        setSelectedItem(item)
        setItemFormOpen(true)
    }

    const handleCloseItemForm = () => {
        setItemFormOpen(false)
        setSelectedItem(null)
    }

    if (orderLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div>Cargando...</div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <h4 className="mb-4">Orden de compra no encontrada</h4>
                <Button
                    variant="solid"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/purchase-orders')}
                >
                    Volver a Órdenes de Compra
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
                        onClick={() => navigate('/purchase-orders')}
                    />
                    <h3>Orden {order.orderNumber}</h3>
                    <Badge
                        content={PURCHASE_ORDER_STATUS_LABELS[order.status]}
                        className={PURCHASE_ORDER_STATUS_CLASSES[order.status]}
                    />
                </div>
                <div className="flex gap-2">
                    {isDraft && (
                        <>
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<HiOutlinePencil />}
                                onClick={handleEditOrder}
                            >
                                Editar
                            </Button>
                            <Button
                                size="sm"
                                variant="solid"
                                color="blue-600"
                                icon={<HiOutlinePaperAirplane />}
                                onClick={() => setSendDialogOpen(true)}
                            >
                                Enviar
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
                    {canReceive && (
                        <Button
                            size="sm"
                            variant="solid"
                            color="emerald-600"
                            icon={<HiOutlineArchiveBox />}
                            onClick={() => setReceiveFormOpen(true)}
                        >
                            Recibir Mercancía
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

            {/* Order Info */}
            <Card>
                <h5 className="mb-4">Información de la Orden</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Proveedor</p>
                        <p className="font-medium">
                            {getSupplierName(order.supplierId)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Número de Orden</p>
                        <p className="font-medium">{order.orderNumber}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Fecha Esperada</p>
                        <p className="font-medium">
                            {order.expectedDate
                                ? new Date(
                                      order.expectedDate
                                  ).toLocaleDateString('es-EC')
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Fecha de Creación
                        </p>
                        <p className="font-medium">
                            {order.createdAt
                                ? new Date(order.createdAt).toLocaleString(
                                      'es-EC'
                                  )
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Última Actualización
                        </p>
                        <p className="font-medium">
                            {order.updatedAt
                                ? new Date(order.updatedAt).toLocaleString(
                                      'es-EC'
                                  )
                                : '-'}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t dark:border-gray-600">
                    <div>
                        <p className="text-sm text-gray-500">Subtotal</p>
                        <p className="font-medium">
                            {formatCurrency(order.subtotal)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Impuestos</p>
                        <p className="font-medium">
                            {formatCurrency(order.tax)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-lg font-semibold">
                            {formatCurrency(order.total)}
                        </p>
                    </div>
                </div>
                {order.notes && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-600">
                        <p className="text-sm text-gray-500">Notas</p>
                        <p className="font-medium">{order.notes}</p>
                    </div>
                )}
            </Card>

            {/* Items */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h5>Items de la Orden ({items.length})</h5>
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
                        No hay items en esta orden
                    </div>
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Producto</Th>
                                <Th>Cant. Pedida</Th>
                                <Th>Cant. Recibida</Th>
                                <Th>Cant. Pendiente</Th>
                                <Th>Costo Unitario</Th>
                                <Th>Subtotal</Th>
                                {isDraft && <Th>Acciones</Th>}
                            </Tr>
                        </THead>
                        <TBody>
                            {items.map((item) => {
                                const pending =
                                    item.quantityOrdered - item.quantityReceived
                                const subtotal =
                                    item.unitCost * item.quantityOrdered
                                return (
                                    <Tr key={item.id}>
                                        <Td>
                                            {getProductName(item.productId)}
                                        </Td>
                                        <Td>{item.quantityOrdered}</Td>
                                        <Td>{item.quantityReceived}</Td>
                                        <Td>
                                            {pending > 0 ? (
                                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                                    {pending}
                                                </span>
                                            ) : (
                                                <span className="text-emerald-600 dark:text-emerald-400">
                                                    0
                                                </span>
                                            )}
                                        </Td>
                                        <Td>{formatCurrency(item.unitCost)}</Td>
                                        <Td className="font-medium">
                                            {formatCurrency(subtotal)}
                                        </Td>
                                        {isDraft && (
                                            <Td>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="plain"
                                                        icon={
                                                            <HiOutlinePencil />
                                                        }
                                                        onClick={() =>
                                                            handleEditItem(item)
                                                        }
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="plain"
                                                        icon={
                                                            <HiOutlineTrash />
                                                        }
                                                        onClick={() =>
                                                            setDeleteItemDialog(
                                                                {
                                                                    open: true,
                                                                    item,
                                                                }
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </Td>
                                        )}
                                    </Tr>
                                )
                            })}
                        </TBody>
                        <TFoot>
                            <Tr>
                                <Td
                                    colSpan={isDraft ? 6 : 5}
                                    className="text-right font-medium"
                                >
                                    Total
                                </Td>
                                <Td className="font-semibold">
                                    {formatCurrency(order.total)}
                                </Td>
                                {isDraft && <Td />}
                            </Tr>
                        </TFoot>
                    </Table>
                )}
            </Card>

            {/* Receipts */}
            {order.status !== 'draft' && (
                <Card>
                    <h5 className="mb-4">Recepciones ({receipts.length})</h5>
                    {receipts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No hay recepciones registradas
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {receipts.map((receipt) => (
                                <div
                                    key={receipt.id}
                                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">
                                                Recepción #{receipt.id}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {receipt.receivedAt
                                                    ? new Date(
                                                          receipt.receivedAt
                                                      ).toLocaleString('es-EC')
                                                    : receipt.createdAt
                                                    ? new Date(
                                                          receipt.createdAt
                                                      ).toLocaleString('es-EC')
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>
                                    {receipt.notes && (
                                        <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                                            {receipt.notes}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* Item Form Modal */}
            <PurchaseOrderItemForm
                orderId={orderId}
                item={selectedItem}
                open={itemFormOpen}
                onClose={handleCloseItemForm}
            />

            {/* Receive Form Modal */}
            <ReceiveForm
                orderId={orderId}
                items={items}
                open={receiveFormOpen}
                getProductName={getProductName}
                onClose={() => setReceiveFormOpen(false)}
            />

            {/* Edit Order Dialog */}
            <Dialog
                isOpen={editDialogOpen}
                width={500}
                onClose={() => setEditDialogOpen(false)}
                onRequestClose={() => setEditDialogOpen(false)}
            >
                <h5 className="mb-4">Editar Orden de Compra</h5>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Proveedor <span className="text-red-500">*</span>
                        </label>
                        <Select
                            placeholder="Seleccionar proveedor"
                            options={supplierOptions}
                            value={supplierOptions.find(
                                (o) =>
                                    o.value === editData.supplierId.toString()
                            )}
                            onChange={(option) =>
                                setEditData({
                                    ...editData,
                                    supplierId: option
                                        ? parseInt(option.value)
                                        : 0,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Fecha Esperada
                        </label>
                        <Input
                            type="date"
                            value={editData.expectedDate || ''}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    expectedDate: e.target.value,
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
                        loading={updateOrder.isPending}
                        disabled={editData.supplierId === 0}
                        onClick={handleSaveEdit}
                    >
                        Guardar
                    </Button>
                </div>
            </Dialog>

            {/* Send Dialog */}
            <Dialog
                isOpen={sendDialogOpen}
                onClose={() => setSendDialogOpen(false)}
                onRequestClose={() => setSendDialogOpen(false)}
            >
                <h5 className="mb-4">Enviar Orden de Compra</h5>
                <p className="mb-4">
                    ¿Está seguro que desea enviar esta orden al proveedor? Una
                    vez enviada, los items no podrán ser modificados.
                </p>
                {items.length > 0 ? (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium mb-2">
                            Items de la orden:
                        </p>
                        <ul className="text-sm space-y-1">
                            {items.map((item) => (
                                <li key={item.id}>
                                    <span className="font-medium">
                                        {getProductName(item.productId)}
                                    </span>
                                    :{' '}
                                    <span className="text-blue-600 dark:text-blue-400">
                                        {item.quantityOrdered} uds. x{' '}
                                        {formatCurrency(item.unitCost)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-2 pt-2 border-t dark:border-gray-600 font-medium">
                            Total: {formatCurrency(order.total)}
                        </p>
                    </div>
                ) : (
                    <p className="mb-4 text-sm text-red-500">
                        No se puede enviar una orden sin items.
                    </p>
                )}
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        onClick={() => setSendDialogOpen(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={sendOrder.isPending}
                        disabled={items.length === 0}
                        onClick={handleSend}
                    >
                        Enviar
                    </Button>
                </div>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog
                isOpen={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                onRequestClose={() => setCancelDialogOpen(false)}
            >
                <h5 className="mb-4">Cancelar Orden de Compra</h5>
                <p className="mb-6">
                    ¿Está seguro que desea cancelar esta orden de compra?
                    {isPartial && ' La mercancía ya recibida no será afectada.'}
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
                        loading={cancelOrder.isPending}
                        onClick={handleCancel}
                    >
                        Cancelar Orden
                    </Button>
                </div>
            </Dialog>

            {/* Delete Order Dialog */}
            <Dialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onRequestClose={() => setDeleteDialogOpen(false)}
            >
                <h5 className="mb-4">Eliminar Orden de Compra</h5>
                <p className="mb-6">
                    ¿Está seguro que desea eliminar esta orden de compra? Esta
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
                        loading={deleteOrder.isPending}
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
                    ¿Está seguro que desea eliminar este item de la orden? Esta
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

export default PurchaseOrderDetailView
