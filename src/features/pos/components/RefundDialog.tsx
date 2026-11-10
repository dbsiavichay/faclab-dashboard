import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import { notifySuccess, notifyWarning, notifyError } from '@shared/ui/notify'
import { POS_ERROR_MESSAGES } from '../model/errors'
import { saleLabel } from '../lib/saleLabel'
import { roundMoney } from '@shared/lib/money'
import { useCreateRefund, useProcessRefund } from '../hooks/usePOS'
import {
    getProduct,
    getRefund,
    getRefunds,
    getSale,
    getSaleItems,
} from '../api/client'
import {
    invoicedToFinalConsumer,
    refundedQuantities,
    saleHasInvoice,
} from '../model/refunds'
import { discountFactor, taxBreakdown } from '../model/totals'
import {
    POS_PAYMENT_METHOD_LABELS,
    POS_PAYMENT_METHODS,
    REFUNDABLE_SALE_STATUSES,
    type POSSale,
    type POSSaleItem,
    type POSPaymentMethod,
} from '../model/types'
import { HiOutlineSearch, HiMinus, HiPlus } from 'react-icons/hi'
import { formatCurrency } from '@shared/lib/format'
import {
    formatQuantity,
    parseQuantity,
    roundQuantity,
} from '@shared/lib/quantity'

interface RefundDialogProps {
    isOpen: boolean
    onClose: () => void
}

/**
 * La cantidad a devolver de un ítem (S5.1): se escribe con decimales (1,25 m) o
 * se cambia de uno en uno; el diálogo la limita a lo que queda por devolver y
 * faclab-core valida los decimales de la unidad
 */
const RefundQuantityInput = ({
    label,
    value,
    onChange,
}: {
    label: string
    value: number
    onChange: (quantity: number) => void
}) => {
    const [draft, setDraft] = useState<string | null>(null)
    const commit = () => {
        if (draft === null) return
        const quantity = parseQuantity(draft)
        if (quantity !== null) onChange(quantity)
        setDraft(null)
    }
    return (
        <Input
            size="sm"
            inputMode="decimal"
            autoComplete="off"
            className="w-16 text-center tabular-nums"
            aria-label={label}
            value={draft ?? formatQuantity(value)}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
                if (e.key === 'Enter') commit()
                if (e.key === 'Escape') setDraft(null)
            }}
        />
    )
}

interface RefundItemSelection {
    saleItem: POSSaleItem
    productName: string
    maxQuantity: number
    selectedQuantity: number
}

/**
 * Lo que ya se devolvió de cada ítem. Solo ayuda a no ofrecer de más: el backend
 * rechaza lo que exceda, así que sin poder leerlo (un rol sin historial) el
 * diálogo sigue sirviendo.
 */
const alreadyRefunded = async (
    saleId: number
): Promise<Map<number, number>> => {
    try {
        const previous = await getRefunds({ saleId })
        const details = await Promise.all(
            previous.data
                .filter((refund) => refund.status !== 'CANCELLED')
                .map((refund) => getRefund(refund.id))
        )
        return refundedQuantities(details.map((detail) => detail.data))
    } catch {
        return new Map()
    }
}

const RefundDialog = ({ isOpen, onClose }: RefundDialogProps) => {
    const [saleIdInput, setSaleIdInput] = useState('')
    const [sale, setSale] = useState<POSSale | null>(null)
    const [items, setItems] = useState<RefundItemSelection[]>([])
    const [loading, setLoading] = useState(false)
    const [reason, setReason] = useState('')
    const [step, setStep] = useState<'search' | 'select' | 'payment'>('search')
    const [paymentMethod, setPaymentMethod] = useState<POSPaymentMethod>('CASH')
    const [refundId, setRefundId] = useState<number | null>(null)
    // Amount computed by the backend once the refund exists
    const [refundTotal, setRefundTotal] = useState(0)

    const createRefund = useCreateRefund()
    const processRefund = useProcessRefund()

    const handleSearch = async () => {
        const id = parseInt(saleIdInput)
        if (!id || id <= 0) return

        setLoading(true)
        try {
            const saleResponse = await getSale(id)
            const saleData = saleResponse.data

            if (!REFUNDABLE_SALE_STATUSES.includes(saleData.status)) {
                notifyWarning(
                    'Solo se pueden devolver ventas confirmadas o facturadas'
                )
                setLoading(false)
                return
            }

            if (invoicedToFinalConsumer(saleData)) {
                notifyWarning(
                    'La factura a consumidor final no se anula ni admite nota de crédito (Res. NAC-DGERCGC25-00000014): esta venta no se puede devolver'
                )
                setLoading(false)
                return
            }

            const itemsResponse = await getSaleItems(id)
            const saleItems = itemsResponse.data

            const refunded = await alreadyRefunded(id)

            const selections: RefundItemSelection[] = []
            for (const item of saleItems) {
                const productResponse = await getProduct(item.productId)
                const product = productResponse.data
                selections.push({
                    saleItem: item,
                    // The box or roll it was sold in (S5.2): it is refunded in it
                    productName:
                        item.presentationName && item.unitFactor !== 1
                            ? `${product.name} (${item.presentationName})`
                            : product.name,
                    // Decimal quantities (S5.1): no float noise in 2,5 - 1,25
                    maxQuantity: roundQuantity(
                        Math.max(
                            0,
                            item.quantity - (refunded.get(item.id) ?? 0)
                        )
                    ),
                    selectedQuantity: 0,
                })
            }

            setSale(saleData)
            setItems(selections)
            setStep('select')
        } catch (error: unknown) {
            notifyError(error, 'Venta no encontrada')
        } finally {
            setLoading(false)
        }
    }

    const updateQuantity = (index: number, qty: number) => {
        setItems((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                          ...item,
                          selectedQuantity: roundQuantity(
                              Math.max(0, Math.min(qty, item.maxQuantity))
                          ),
                      }
                    : item
            )
        )
    }

    const selectAll = () => {
        setItems((prev) =>
            prev.map((item) => ({
                ...item,
                selectedQuantity: item.maxQuantity,
            }))
        )
    }

    const selectedItems = items.filter((i) => i.selectedQuantity > 0)
    const hasInvoice = sale ? saleHasInvoice(sale) : false
    const nothingLeft = items.every((i) => i.maxQuantity === 0)
    // The XML of its credit note requires a reason
    const reasonMissing = hasInvoice && reason.trim() === ''

    // Preview: what was charged for these items, with the sale's global
    // discount prorated, rounded like the backend refund
    const preview = taxBreakdown(
        selectedItems.map((item) => ({
            taxCode: item.saleItem.taxCode,
            subtotal:
                item.saleItem.unitPrice *
                item.selectedQuantity *
                (1 - item.saleItem.discount / 100),
        })),
        sale ? discountFactor(sale.subtotal, sale.discount) : 1
    )
    const previewTotal = roundMoney(preview.base + preview.tax)

    const handleCreateRefund = async () => {
        if (selectedItems.length === 0 || !sale) return

        try {
            const refund = await createRefund.mutateAsync({
                originalSaleId: sale.id,
                items: selectedItems.map((i) => ({
                    saleItemId: i.saleItem.id,
                    quantity: i.selectedQuantity,
                })),
                reason: reason.trim() || undefined,
            })
            setRefundId(refund.id)
            setRefundTotal(refund.total)
            setStep('payment')
        } catch (error: unknown) {
            notifyError(error, 'Error al crear la devolución', {
                messages: POS_ERROR_MESSAGES,
            })
        }
    }

    const handleProcessRefund = async () => {
        if (!refundId) return

        try {
            await processRefund.mutateAsync({
                refundId,
                data: {
                    payments: [
                        {
                            amount: refundTotal,
                            paymentMethod,
                        },
                    ],
                },
            })
            notifySuccess(
                'Devolución procesada correctamente',
                hasInvoice
                    ? 'Su nota de crédito se está emitiendo: la verás en Devoluciones'
                    : undefined
            )
            handleClose()
        } catch (error: unknown) {
            notifyError(error, 'Error al procesar la devolución', {
                messages: POS_ERROR_MESSAGES,
            })
        }
    }

    const handleClose = () => {
        setSaleIdInput('')
        setSale(null)
        setItems([])
        setReason('')
        setStep('search')
        setPaymentMethod('CASH')
        setRefundId(null)
        setRefundTotal(0)
        onClose()
    }

    return (
        <Dialog
            isOpen={isOpen}
            width={550}
            overlayClassName="!z-[60]"
            onClose={handleClose}
        >
            <h4 className="text-lg font-bold mb-4">Devolución</h4>

            {step === 'search' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ingrese el número de venta para iniciar la devolución
                    </p>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            value={saleIdInput}
                            placeholder="# de venta"
                            prefix={
                                <HiOutlineSearch className="text-gray-400" />
                            }
                            onChange={(e) => setSaleIdInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch()
                            }}
                        />
                        <Button
                            variant="solid"
                            loading={loading}
                            onClick={handleSearch}
                        >
                            Buscar
                        </Button>
                    </div>
                </div>
            )}

            {step === 'select' && sale && (
                <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-sm font-medium">
                            Venta {saleLabel(sale)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Total: {formatCurrency(sale.total)}
                        </p>
                    </div>

                    {hasInvoice && (
                        <p className="text-sm p-3 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                            Esta venta tiene factura: la devolución genera una
                            nota de crédito electrónica.
                        </p>
                    )}

                    {nothingLeft ? (
                        <p className="text-sm font-medium">
                            Esta venta ya se devolvió por completo.
                        </p>
                    ) : (
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">
                                Seleccione items a devolver:
                            </p>
                            <Button
                                size="xs"
                                variant="default"
                                onClick={selectAll}
                            >
                                {hasInvoice
                                    ? 'Anular venta (devolver todo)'
                                    : 'Devolver todo'}
                            </Button>
                        </div>
                    )}

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {items.map((item, index) => (
                            <div
                                key={item.saleItem.id}
                                className="flex items-center gap-3 p-2 border border-gray-200 dark:border-gray-600 rounded"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {item.productName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatCurrency(
                                            item.saleItem.unitPrice
                                        )}{' '}
                                        x {formatQuantity(item.maxQuantity)}{' '}
                                        (máx)
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        size="xs"
                                        variant="plain"
                                        aria-label="Disminuir cantidad"
                                        icon={<HiMinus />}
                                        onClick={() =>
                                            updateQuantity(
                                                index,
                                                item.selectedQuantity - 1
                                            )
                                        }
                                    />
                                    <RefundQuantityInput
                                        label={`Cantidad a devolver de ${item.productName}`}
                                        value={item.selectedQuantity}
                                        onChange={(qty) =>
                                            updateQuantity(index, qty)
                                        }
                                    />
                                    <Button
                                        size="xs"
                                        variant="plain"
                                        aria-label="Aumentar cantidad"
                                        icon={<HiPlus />}
                                        onClick={() =>
                                            updateQuantity(
                                                index,
                                                item.selectedQuantity + 1
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <Input
                        value={reason}
                        maxLength={300}
                        placeholder={
                            hasInvoice
                                ? 'Motivo (obligatorio: va en la nota de crédito)'
                                : 'Razón de devolución (opcional)'
                        }
                        onChange={(e) => setReason(e.target.value)}
                    />

                    {previewTotal > 0 && (
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Total a devolver
                            </p>
                            <p className="text-xl font-bold text-red-500">
                                {formatCurrency(previewTotal)}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button block variant="default" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button
                            block
                            variant="solid"
                            disabled={
                                selectedItems.length === 0 || reasonMissing
                            }
                            loading={createRefund.isPending}
                            onClick={handleCreateRefund}
                        >
                            Continuar
                        </Button>
                    </div>
                </div>
            )}

            {step === 'payment' && (
                <div className="space-y-4">
                    {loading && (
                        <div className="flex justify-center py-4">
                            <Spinner />
                        </div>
                    )}

                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total a devolver
                        </p>
                        <p className="text-3xl font-bold text-red-500">
                            {formatCurrency(refundTotal)}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-medium mb-2">
                            Método de pago:
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {POS_PAYMENT_METHODS.map((method) => (
                                <Button
                                    key={method}
                                    block
                                    variant={
                                        paymentMethod === method
                                            ? 'solid'
                                            : 'default'
                                    }
                                    size="sm"
                                    onClick={() => setPaymentMethod(method)}
                                >
                                    {POS_PAYMENT_METHOD_LABELS[method]}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            block
                            variant="default"
                            onClick={() => setStep('select')}
                        >
                            Atrás
                        </Button>
                        <Button
                            block
                            variant="solid"
                            loading={processRefund.isPending}
                            onClick={handleProcessRefund}
                        >
                            Procesar Devolución
                        </Button>
                    </div>
                </div>
            )}
        </Dialog>
    )
}

export default RefundDialog
