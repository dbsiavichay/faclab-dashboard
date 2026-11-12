import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Table from '@/components/ui/Table'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import LabeledField from '@/components/shared/LabeledField'
import { PERMISSION } from '@/constants/permissions.constant'
import { TAX_CODE_LABELS } from '@/constants/tax.constant'
import { useCan } from '@/stores'
import {
    formatCurrency,
    formatDatetime,
    formatProductLabel,
} from '@shared/lib/format'
import { formatQuantity } from '@shared/lib/quantity'
import { notifyError, notifySuccess } from '@shared/ui/notify'
import {
    HiOutlineArrowLeft,
    HiOutlineCheck,
    HiOutlinePencil,
    HiOutlinePlus,
    HiOutlineTrash,
} from 'react-icons/hi'
import { usePurchaseOrderItems } from '../hooks/usePurchaseOrders'
import {
    useSupplierReturn,
    useSupplierReturnItemMutations,
    useSupplierReturnItems,
    useSupplierReturnMutations,
} from '../hooks/useSupplierReturns'
import SupplierReturnItemForm from '../components/SupplierReturnItemForm'
import {
    SUPPLIER_RETURN_ERROR_MESSAGES,
    SUPPLIER_RETURN_STATUS_LABELS,
    SUPPLIER_RETURN_STATUS_TONES,
    type SupplierReturnItem,
} from '../model/types'

const { Tr, Th, Td, THead, TBody } = Table

const Field = ({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <div className="font-medium">{children}</div>
    </div>
)

const SupplierReturnDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const returnId = parseInt(id || '0')
    const canWrite = useCan(PERMISSION.PURCHASE_WRITE)
    const canConfirm = useCan(PERMISSION.PURCHASE_CONFIRM)

    const { data: supplierReturn, isLoading } = useSupplierReturn(returnId)
    const { data: lines = [] } = useSupplierReturnItems(returnId)
    const { data: orderItems = [] } = usePurchaseOrderItems(
        supplierReturn?.purchaseOrderId ?? 0
    )
    const mutations = useSupplierReturnMutations()
    const itemMutations = useSupplierReturnItemMutations(returnId)

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<SupplierReturnItem | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [creditNote, setCreditNote] = useState('')

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div>Cargando...</div>
            </div>
        )
    }
    if (!supplierReturn) {
        return (
            <EmptyState
                className="min-h-[24rem]"
                title="Devolución no encontrada"
                action={
                    <Button
                        size="sm"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/supplier-returns')}
                    >
                        Volver a Devoluciones
                    </Button>
                }
            />
        )
    }

    const isDraft = supplierReturn.status === 'draft'
    const editable = isDraft && canWrite

    const handleConfirm = async () => {
        try {
            const confirmed = await mutations.confirm.mutateAsync({
                id: returnId,
                supplierCreditNoteNumber: creditNote.trim() || null,
            })
            setConfirmOpen(false)
            notifySuccess(
                'Devolución confirmada',
                confirmed.refundDue > 0
                    ? `El proveedor debe reembolsar ${formatCurrency(
                          confirmed.refundDue
                      )}`
                    : `Se descontó ${formatCurrency(
                          confirmed.creditedAmount
                      )} de lo que se le debe`
            )
        } catch (error: unknown) {
            notifyError(error, 'Error al confirmar la devolución', {
                messages: SUPPLIER_RETURN_ERROR_MESSAGES,
            })
        }
    }

    const handleDelete = async () => {
        try {
            await mutations.remove.mutateAsync(returnId)
            notifySuccess('Devolución eliminada')
            navigate('/supplier-returns')
        } catch (error: unknown) {
            notifyError(error, 'Error al eliminar la devolución')
        }
    }

    const handleRemoveLine = async (line: SupplierReturnItem) => {
        try {
            await itemMutations.remove.mutateAsync(line.id)
            notifySuccess('Línea eliminada')
        } catch (error: unknown) {
            notifyError(error, 'Error al eliminar la línea')
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                className="!mb-1"
                title={`Devolución ${
                    supplierReturn.number ?? `#${supplierReturn.id}`
                }`}
                badge={
                    <StatusBadge
                        tone={
                            SUPPLIER_RETURN_STATUS_TONES[supplierReturn.status]
                        }
                    >
                        {SUPPLIER_RETURN_STATUS_LABELS[supplierReturn.status]}
                    </StatusBadge>
                }
                actions={
                    isDraft && (
                        <div className="flex gap-2">
                            {canConfirm && (
                                <Button
                                    size="sm"
                                    variant="solid"
                                    color="emerald-600"
                                    icon={<HiOutlineCheck />}
                                    disabled={lines.length === 0}
                                    onClick={() => setConfirmOpen(true)}
                                >
                                    Confirmar
                                </Button>
                            )}
                            {canWrite && (
                                <Button
                                    size="sm"
                                    variant="plain"
                                    icon={<HiOutlineTrash />}
                                    onClick={() => setDeleteOpen(true)}
                                >
                                    Eliminar
                                </Button>
                            )}
                        </div>
                    )
                }
                onBack={() => navigate('/supplier-returns')}
            />

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Proveedor">
                        {supplierReturn.supplierName ??
                            `#${supplierReturn.supplierId}`}
                    </Field>
                    <Field label="Orden de compra">
                        <Link
                            className="text-primary hover:underline"
                            to={`/purchase-orders/${supplierReturn.purchaseOrderId}`}
                        >
                            {supplierReturn.orderNumber ??
                                `#${supplierReturn.purchaseOrderId}`}
                        </Link>
                    </Field>
                    <Field label="Nota de crédito del proveedor">
                        {supplierReturn.supplierCreditNoteNumber ?? '-'}
                    </Field>
                    {supplierReturn.confirmedAt && (
                        <Field label="Confirmada">
                            {formatDatetime(supplierReturn.confirmedAt)}
                            {supplierReturn.confirmedBy &&
                                ` · ${supplierReturn.confirmedBy}`}
                        </Field>
                    )}
                    {supplierReturn.notes && (
                        <Field label="Motivo">{supplierReturn.notes}</Field>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t dark:border-gray-600">
                    <Field label="Subtotal">
                        {formatCurrency(supplierReturn.subtotal)}
                    </Field>
                    <Field label="IVA">
                        {formatCurrency(supplierReturn.tax)}
                    </Field>
                    <Field label="Total">
                        <span className="text-lg font-semibold">
                            {formatCurrency(supplierReturn.total)}
                        </span>
                    </Field>
                    {!isDraft && (
                        <>
                            <Field label="Descontado de lo que se debe">
                                {formatCurrency(supplierReturn.creditedAmount)}
                            </Field>
                            <Field label="Por reembolsar">
                                <span
                                    className={
                                        supplierReturn.refundDue > 0
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : undefined
                                    }
                                >
                                    {formatCurrency(supplierReturn.refundDue)}
                                </span>
                            </Field>
                        </>
                    )}
                </div>
                {supplierReturn.taxes && supplierReturn.taxes.length > 0 && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-600 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        {supplierReturn.taxes.map((rate) => (
                            <div
                                key={rate.taxCode}
                                className="flex justify-between gap-4"
                            >
                                <span>{TAX_CODE_LABELS[rate.taxCode]}</span>
                                <span>
                                    Base {formatCurrency(rate.base)} · IVA{' '}
                                    {formatCurrency(rate.tax)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h5>Líneas ({lines.length})</h5>
                    {editable && (
                        <Button
                            size="sm"
                            variant="solid"
                            icon={<HiOutlinePlus />}
                            onClick={() => {
                                setEditing(null)
                                setFormOpen(true)
                            }}
                        >
                            Agregar línea
                        </Button>
                    )}
                </div>
                {lines.length === 0 ? (
                    <EmptyState
                        className="!py-8"
                        title="Sin líneas"
                        description="Agregue lo que vuelve al proveedor de lo recibido en la orden"
                    />
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Producto</Th>
                                <Th>Cantidad</Th>
                                <Th>Costo</Th>
                                <Th>IVA</Th>
                                <Th>Subtotal</Th>
                                {editable && <Th>Acciones</Th>}
                            </Tr>
                        </THead>
                        <TBody>
                            {lines.map((line) => (
                                <Tr key={line.id}>
                                    <Td>
                                        {formatProductLabel(line)}
                                        {line.presentationName &&
                                            line.unitFactor !== 1 && (
                                                <span className="block text-xs text-gray-500">
                                                    {line.presentationName} ·{' '}
                                                    {formatQuantity(
                                                        line.baseQuantity
                                                    )}{' '}
                                                    en unidades base
                                                </span>
                                            )}
                                    </Td>
                                    <Td>{formatQuantity(line.quantity)}</Td>
                                    <Td>{formatCurrency(line.unitCost)}</Td>
                                    <Td>{TAX_CODE_LABELS[line.taxCode]}</Td>
                                    <Td className="font-medium">
                                        {formatCurrency(line.subtotal)}
                                    </Td>
                                    {editable && (
                                        <Td>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    aria-label="Editar"
                                                    icon={<HiOutlinePencil />}
                                                    onClick={() => {
                                                        setEditing(line)
                                                        setFormOpen(true)
                                                    }}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    aria-label="Eliminar"
                                                    icon={<HiOutlineTrash />}
                                                    onClick={() =>
                                                        handleRemoveLine(line)
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

            <SupplierReturnItemForm
                open={formOpen}
                supplierReturnId={returnId}
                orderItems={orderItems}
                lines={lines}
                line={editing}
                onClose={() => setFormOpen(false)}
            />

            <Dialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onRequestClose={() => setConfirmOpen(false)}
            >
                <h5 className="mb-4">Confirmar devolución</h5>
                <p className="mb-2">Saldrá del stock:</p>
                <ul className="mb-4 list-disc pl-5 text-sm">
                    {lines.map((line) => (
                        <li key={line.id}>
                            {formatProductLabel(line)}:{' '}
                            {formatQuantity(line.baseQuantity)} unidades base
                        </li>
                    ))}
                </ul>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Su total, {formatCurrency(supplierReturn.total)}, se
                    descuenta de lo que se le debe al proveedor; lo que ya se le
                    pagó queda por reembolsar.
                </p>
                <LabeledField label="N.º de nota de crédito del proveedor (opcional)">
                    <Input
                        placeholder="001-001-000000045"
                        maxLength={20}
                        value={creditNote}
                        onChange={(e) => setCreditNote(e.target.value)}
                    />
                </LabeledField>
                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        variant="plain"
                        onClick={() => setConfirmOpen(false)}
                    >
                        Volver
                    </Button>
                    <Button
                        variant="solid"
                        loading={mutations.confirm.isPending}
                        onClick={handleConfirm}
                    >
                        Confirmar devolución
                    </Button>
                </div>
            </Dialog>

            <Dialog
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onRequestClose={() => setDeleteOpen(false)}
            >
                <h5 className="mb-4">Eliminar devolución</h5>
                <p className="mb-6">
                    ¿Eliminar este borrador con sus líneas? Su número no se
                    vuelve a usar.
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        onClick={() => setDeleteOpen(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={mutations.remove.isPending}
                        onClick={handleDelete}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default SupplierReturnDetailPage
