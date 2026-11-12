import { Link } from 'react-router-dom'
import Table from '@/components/ui/Table'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatCurrency } from '@shared/lib/format'
import { formatDueDay } from '../model/days'
import {
    PAYABLE_STATUS_LABELS,
    PAYABLE_STATUS_TONES,
    type Payable,
} from '../model/types'

const { Tr, Th, Td, THead, TBody } = Table

interface PayablesTableProps {
    payables: Payable[]
    /** Show the supplier column (with a link to its account) */
    withSupplier?: boolean
    emptyTitle?: string
}

/** What is owed for each receipt, the one due first first */
const PayablesTable = ({
    payables,
    withSupplier = false,
    emptyTitle = 'No se le debe nada',
}: PayablesTableProps) => {
    if (payables.length === 0) {
        return <EmptyState className="!py-8" title={emptyTitle} />
    }
    return (
        <Table>
            <THead>
                <Tr>
                    {withSupplier && <Th>Proveedor</Th>}
                    <Th>Orden</Th>
                    <Th>Factura</Th>
                    <Th>Recibida</Th>
                    <Th>Vence</Th>
                    <Th>Monto</Th>
                    <Th>Saldo</Th>
                    <Th>Estado</Th>
                </Tr>
            </THead>
            <TBody>
                {payables.map((payable) => (
                    <Tr key={payable.id}>
                        {withSupplier && (
                            <Td>
                                <Link
                                    className="font-medium text-primary-600 hover:underline"
                                    to={`/payables/suppliers/${payable.supplierId}`}
                                >
                                    {payable.supplierName ??
                                        `#${payable.supplierId}`}
                                </Link>
                            </Td>
                        )}
                        <Td>
                            <Link
                                className="text-primary-600 hover:underline"
                                to={`/purchase-orders/${payable.purchaseOrderId}`}
                            >
                                {payable.orderNumber ??
                                    `#${payable.purchaseOrderId}`}
                            </Link>
                        </Td>
                        <Td>{payable.supplierInvoiceNumber ?? '-'}</Td>
                        <Td>{formatDueDay(payable.issuedOn)}</Td>
                        <Td>{formatDueDay(payable.dueOn)}</Td>
                        <Td>{formatCurrency(payable.amount)}</Td>
                        <Td className="font-medium">
                            {formatCurrency(payable.balance)}
                        </Td>
                        <Td>
                            {payable.status === 'OPEN' &&
                            payable.daysOverdue > 0 ? (
                                <StatusBadge tone="danger">
                                    {payable.daysOverdue} días vencida
                                </StatusBadge>
                            ) : (
                                <StatusBadge
                                    tone={PAYABLE_STATUS_TONES[payable.status]}
                                >
                                    {PAYABLE_STATUS_LABELS[payable.status]}
                                </StatusBadge>
                            )}
                        </Td>
                    </Tr>
                ))}
            </TBody>
        </Table>
    )
}

export default PayablesTable
