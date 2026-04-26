import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useReceivePurchaseOrder } from '@/hooks/usePurchaseOrders'
import { useLocations } from '@/hooks/useLocations'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type {
    PurchaseOrderItem,
    ReceiveInput,
} from '@/services/PurchaseOrderService'

const { Tr, Th, Td, THead, TBody } = Table

interface ReceiveFormProps {
    open: boolean
    onClose: () => void
    orderId: number
    items: PurchaseOrderItem[]
    getProductName: (productId: number) => string
}

interface ReceiveItemState {
    purchaseOrderItemId: number
    productId: number
    quantityOrdered: number
    quantityReceived: number
    quantityPending: number
    quantityToReceive: number
    locationId: number | null
    lotNumber: string
    serialNumbers: string
}

const ReceiveForm = ({
    open,
    onClose,
    orderId,
    items,
    getProductName,
}: ReceiveFormProps) => {
    const [receiveItems, setReceiveItems] = useState<ReceiveItemState[]>([])
    const [notes, setNotes] = useState('')
    const [receivedAt, setReceivedAt] = useState('')

    const receiveMutation = useReceivePurchaseOrder()
    const { data: locationsData } = useLocations({ limit: 100 })
    const locations = locationsData?.items ?? []

    const locationOptions = [
        { value: '', label: 'Sin ubicación' },
        ...locations.map((l) => ({
            value: l.id.toString(),
            label: `${l.name} (${l.code})`,
        })),
    ]

    useEffect(() => {
        if (open) {
            const pendingItems = items
                .filter(
                    (item) => item.quantityOrdered - item.quantityReceived > 0
                )
                .map((item) => ({
                    purchaseOrderItemId: item.id,
                    productId: item.productId,
                    quantityOrdered: item.quantityOrdered,
                    quantityReceived: item.quantityReceived,
                    quantityPending:
                        item.quantityOrdered - item.quantityReceived,
                    quantityToReceive: 0,
                    locationId: null as number | null,
                    lotNumber: '',
                    serialNumbers: '',
                }))
            setReceiveItems(pendingItems)
            setNotes('')
            setReceivedAt('')
        }
    }, [open, items])

    const updateItem = (
        index: number,
        field: keyof ReceiveItemState,
        value: string | number | null
    ) => {
        setReceiveItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        )
    }

    const hasItemsToReceive = receiveItems.some(
        (item) => item.quantityToReceive > 0
    )

    const hasInvalidQuantities = receiveItems.some(
        (item) =>
            item.quantityToReceive < 0 ||
            item.quantityToReceive > item.quantityPending
    )

    const isValid = hasItemsToReceive && !hasInvalidQuantities

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const filteredItems = receiveItems
            .filter((item) => item.quantityToReceive > 0)
            .map((item) => ({
                purchaseOrderItemId: item.purchaseOrderItemId,
                quantityReceived: item.quantityToReceive,
                locationId: item.locationId || undefined,
                lotNumber: item.lotNumber || undefined,
                serialNumbers: item.serialNumbers
                    ? item.serialNumbers
                          .split(',')
                          .map((s) => s.trim())
                          .filter((s) => s.length > 0)
                    : undefined,
            }))

        const data: ReceiveInput = {
            items: filteredItems,
            notes: notes || undefined,
            receivedAt: receivedAt ? `${receivedAt}T00:00:00Z` : undefined,
        }

        try {
            await receiveMutation.mutateAsync({ id: orderId, data })

            toast.push(
                <Notification title="Mercancía recibida" type="success">
                    La recepción se registró correctamente
                </Notification>,
                { placement: 'top-end' }
            )

            onClose()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al registrar la recepción')}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const isPending = receiveMutation.isPending

    const handleClose = () => {
        if (!isPending) {
            onClose()
        }
    }

    return (
        <Dialog
            isOpen={open}
            width={900}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <div className="flex flex-col h-full justify-between">
                <h5 className="mb-4">Recibir Mercancía</h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="max-h-[60vh] overflow-y-auto pr-1">
                        {receiveItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No hay items pendientes de recepción
                            </div>
                        ) : (
                            <Table>
                                <THead>
                                    <Tr>
                                        <Th>Producto</Th>
                                        <Th>Pedida</Th>
                                        <Th>Recibida</Th>
                                        <Th>Pendiente</Th>
                                        <Th>Cant. a Recibir</Th>
                                        <Th>Ubicación</Th>
                                        <Th>Lote</Th>
                                        <Th>Nros. de Serie</Th>
                                    </Tr>
                                </THead>
                                <TBody>
                                    {receiveItems.map((item, index) => (
                                        <Tr key={item.purchaseOrderItemId}>
                                            <Td>
                                                <span className="text-sm">
                                                    {getProductName(
                                                        item.productId
                                                    )}
                                                </span>
                                            </Td>
                                            <Td>{item.quantityOrdered}</Td>
                                            <Td>{item.quantityReceived}</Td>
                                            <Td>
                                                <span className="font-medium text-amber-600 dark:text-amber-400">
                                                    {item.quantityPending}
                                                </span>
                                            </Td>
                                            <Td>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={item.quantityPending}
                                                    size="sm"
                                                    className="w-20"
                                                    value={
                                                        item.quantityToReceive ||
                                                        ''
                                                    }
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            'quantityToReceive',
                                                            parseInt(
                                                                e.target.value
                                                            ) || 0
                                                        )
                                                    }
                                                />
                                                {item.quantityToReceive >
                                                    item.quantityPending && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        Excede pendiente
                                                    </p>
                                                )}
                                            </Td>
                                            <Td>
                                                <Select
                                                    size="sm"
                                                    className="w-40"
                                                    placeholder="Ubicación"
                                                    options={locationOptions}
                                                    value={locationOptions.find(
                                                        (o) =>
                                                            o.value ===
                                                            (item.locationId?.toString() ||
                                                                '')
                                                    )}
                                                    onChange={(option) =>
                                                        updateItem(
                                                            index,
                                                            'locationId',
                                                            option &&
                                                                option.value
                                                                ? parseInt(
                                                                      option.value
                                                                  )
                                                                : null
                                                        )
                                                    }
                                                />
                                            </Td>
                                            <Td>
                                                <Input
                                                    size="sm"
                                                    className="w-28"
                                                    placeholder="Lote"
                                                    value={item.lotNumber}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            'lotNumber',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Td>
                                            <Td>
                                                <Input
                                                    size="sm"
                                                    className="w-36"
                                                    placeholder="SN1, SN2, ..."
                                                    value={item.serialNumbers}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            'serialNumbers',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Fecha de Recepción
                                </label>
                                <Input
                                    type="date"
                                    value={receivedAt}
                                    onChange={(e) =>
                                        setReceivedAt(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Notas
                                </label>
                                <Input
                                    textArea
                                    placeholder="Observaciones de la recepción"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            variant="plain"
                            disabled={isPending}
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={isPending}
                            disabled={!isValid}
                        >
                            Confirmar Recepción
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default ReceiveForm
