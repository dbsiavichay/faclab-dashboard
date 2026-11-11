import Table from '@/components/ui/Table'
import { formatCurrency, formatDate } from '@shared/lib/format'
import { PAYMENT_METHOD_LABELS } from '../model/types'
import { useSalePayments } from '../hooks/useSales'
import EmptyState from '@/components/shared/EmptyState'

const { Tr, Th, Td, THead, TBody, TFoot } = Table

interface SalePaymentsTabProps {
    saleId: number
    saleTotal: number
}

const SalePaymentsTab = ({ saleId, saleTotal }: SalePaymentsTabProps) => {
    const { data: payments = [], isLoading } = useSalePayments(saleId)

    // What is owed on credit (S5.5) is covered by the customer's receivable,
    // not paid: its payments on account are in the portfolio
    const paymentsTotal = payments
        .filter((p) => p.paymentMethod !== 'CREDIT')
        .reduce((sum, p) => sum + p.amount, 0)
    const onCredit = payments
        .filter((p) => p.paymentMethod === 'CREDIT')
        .reduce((sum, p) => sum + p.amount, 0)

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div>Cargando pagos...</div>
            </div>
        )
    }

    if (payments.length === 0) {
        return <EmptyState className="!py-8" title="No hay pagos registrados" />
    }

    return (
        <>
            <Table>
                <THead>
                    <Tr>
                        <Th>Método</Th>
                        <Th>Monto</Th>
                        <Th>Fecha de Pago</Th>
                        <Th>Referencia</Th>
                        <Th>Notas</Th>
                    </Tr>
                </THead>
                <TBody>
                    {payments.map((payment) => (
                        <Tr key={payment.id}>
                            <Td>
                                {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                                {payment.paymentMethod === 'CREDIT' &&
                                    payment.termDays != null &&
                                    ` · ${payment.termDays} días`}
                            </Td>
                            <Td className="font-medium">
                                {formatCurrency(payment.amount)}
                            </Td>
                            <Td>
                                {payment.paymentDate
                                    ? formatDate(payment.paymentDate)
                                    : '-'}
                            </Td>
                            <Td>{payment.reference ?? '-'}</Td>
                            <Td>{payment.notes ?? '-'}</Td>
                        </Tr>
                    ))}
                </TBody>
                <TFoot>
                    <Tr>
                        <Td className="font-medium">Total Pagado</Td>
                        <Td className="font-semibold">
                            {formatCurrency(paymentsTotal)}
                        </Td>
                        <Td colSpan={3} />
                    </Tr>
                    {onCredit > 0 && (
                        <Tr>
                            <Td className="font-medium">A crédito</Td>
                            <Td className="font-semibold">
                                {formatCurrency(onCredit)}
                            </Td>
                            <Td colSpan={3} className="text-sm text-gray-500">
                                En la cuenta por cobrar del cliente
                            </Td>
                        </Tr>
                    )}
                </TFoot>
            </Table>
            {paymentsTotal + onCredit < saleTotal && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-sm text-amber-700 dark:text-amber-400">
                    Saldo pendiente:{' '}
                    <span className="font-semibold">
                        {formatCurrency(saleTotal - paymentsTotal - onCredit)}
                    </span>
                </div>
            )}
        </>
    )
}

export default SalePaymentsTab
