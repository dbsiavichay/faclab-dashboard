import { useState } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Table from '@/components/ui/Table'
import Spinner from '@/components/ui/Spinner'
import LabeledField from '@/components/shared/LabeledField'
import ErrorState from '@/components/shared/ErrorState'
import { PAYMENT_METHOD_LABELS } from '@features/sales'
import { formatCurrency, formatDate } from '@shared/lib/format'
import { useCustomerStatement } from '../hooks/useReceivables'
import { STATEMENT_LINE_LABELS } from '../model/types'

const { Tr, Th, Td, THead, TBody, TFoot } = Table

/**
 * El estado de cuenta del cliente: el saldo al empezar el período, cada venta a
 * crédito (cargo), abono, devolución y anulación con el saldo después, y el
 * saldo al terminar. Sin hasta, el saldo final es lo que debe hoy.
 */
const StatementCard = ({ customerId }: { customerId: number }) => {
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const { data, isLoading, error, refetch } = useCustomerStatement(
        customerId,
        {
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
        }
    )

    return (
        <Card>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <h5>Estado de cuenta</h5>
                <div className="flex flex-wrap gap-3">
                    <LabeledField label="Desde" className="w-40">
                        <Input
                            type="date"
                            size="sm"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </LabeledField>
                    <LabeledField label="Hasta" className="w-40">
                        <Input
                            type="date"
                            size="sm"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </LabeledField>
                </div>
            </div>
            {error ? (
                <ErrorState onRetry={refetch} />
            ) : isLoading || !data ? (
                <div className="flex justify-center py-8">
                    <Spinner />
                </div>
            ) : (
                <Table>
                    <THead>
                        <Tr>
                            <Th>Fecha</Th>
                            <Th>Movimiento</Th>
                            <Th>Cargo</Th>
                            <Th>Abono</Th>
                            <Th>Saldo</Th>
                        </Tr>
                    </THead>
                    <TBody>
                        <Tr>
                            <Td colSpan={4} className="text-gray-500">
                                Saldo inicial
                            </Td>
                            <Td className="font-medium">
                                {formatCurrency(data.openingBalance)}
                            </Td>
                        </Tr>
                        {data.lines.map((line) => (
                            <Tr key={`${line.type}-${line.id}`}>
                                <Td>{formatDate(line.date)}</Td>
                                <Td>
                                    <span className="font-medium">
                                        {STATEMENT_LINE_LABELS[line.type]}
                                    </span>{' '}
                                    {line.documentNumber}
                                    {line.paymentMethod &&
                                        ` · ${
                                            PAYMENT_METHOD_LABELS[
                                                line.paymentMethod
                                            ]
                                        }`}
                                </Td>
                                <Td>
                                    {line.charge > 0
                                        ? formatCurrency(line.charge)
                                        : ''}
                                </Td>
                                <Td>
                                    {line.credit > 0
                                        ? formatCurrency(line.credit)
                                        : ''}
                                </Td>
                                <Td>{formatCurrency(line.balance)}</Td>
                            </Tr>
                        ))}
                    </TBody>
                    <TFoot>
                        <Tr>
                            <Td colSpan={4} className="font-medium">
                                Saldo final
                            </Td>
                            <Td className="font-semibold">
                                {formatCurrency(data.closingBalance)}
                            </Td>
                        </Tr>
                    </TFoot>
                </Table>
            )}
        </Card>
    )
}

export default StatementCard
