import { Link } from 'react-router-dom'
import Table from '@/components/ui/Table'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatCurrency } from '@shared/lib/format'
import { formatDueDay } from '../model/days'
import type { Receivable } from '../model/types'

const { Tr, Th, Td, THead, TBody } = Table

/** Las cuentas abiertas del cliente, la que vence antes primero */
const OpenReceivablesTable = ({
    receivables,
}: {
    receivables: Receivable[]
}) => {
    if (receivables.length === 0) {
        return <EmptyState className="!py-8" title="No debe nada" />
    }
    return (
        <Table>
            <THead>
                <Tr>
                    <Th>Venta</Th>
                    <Th>Emitida</Th>
                    <Th>Vence</Th>
                    <Th>Monto</Th>
                    <Th>Saldo</Th>
                    <Th>Estado</Th>
                </Tr>
            </THead>
            <TBody>
                {receivables.map((receivable) => (
                    <Tr key={receivable.id}>
                        <Td>
                            <Link
                                className="font-medium text-primary-600 hover:underline"
                                to={`/sales/${receivable.saleId}`}
                            >
                                {receivable.saleNumber ??
                                    `#${receivable.saleId}`}
                            </Link>
                        </Td>
                        <Td>{formatDueDay(receivable.issuedOn)}</Td>
                        <Td>{formatDueDay(receivable.dueOn)}</Td>
                        <Td>{formatCurrency(receivable.amount)}</Td>
                        <Td className="font-medium">
                            {formatCurrency(receivable.balance)}
                        </Td>
                        <Td>
                            {receivable.daysOverdue > 0 ? (
                                <StatusBadge tone="danger">
                                    {receivable.daysOverdue} días vencida
                                </StatusBadge>
                            ) : (
                                <StatusBadge tone="success">
                                    Por vencer
                                </StatusBadge>
                            )}
                        </Td>
                    </Tr>
                ))}
            </TBody>
        </Table>
    )
}

export default OpenReceivablesTable
