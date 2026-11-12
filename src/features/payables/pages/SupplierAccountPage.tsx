import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { HiOutlineCash } from 'react-icons/hi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import ErrorState from '@/components/shared/ErrorState'
import EmptyState from '@/components/shared/EmptyState'
import { PERMISSION } from '@/constants/permissions.constant'
import { useCan } from '@/stores'
import { isApiError } from '@/utils/errors/ApiError'
import { PAYMENT_METHOD_LABELS } from '@features/sales'
import { formatCurrency, formatDatetime } from '@shared/lib/format'
import PayablesTable from '../components/PayablesTable'
import SupplierPaymentDialog from '../components/SupplierPaymentDialog'
import { useSupplierAccount } from '../hooks/usePayables'

const { Tr, Th, Td, THead, TBody } = Table

/**
 * La cuenta de un proveedor (S5.7): lo que se le debe, sus cuentas abiertas,
 * sus pagos y sus devoluciones. Quien paga a proveedores registra aquí los
 * pagos.
 */
const SupplierAccountPage = () => {
    const navigate = useNavigate()
    const supplierId = Number(useParams().id ?? 0)
    const canWrite = useCan(PERMISSION.PAYABLE_WRITE)
    const {
        data: account,
        isLoading,
        error,
        refetch,
    } = useSupplierAccount(supplierId)
    const [paying, setPaying] = useState(false)

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Spinner size={40} />
            </div>
        )
    }
    if (error || !account) {
        return isApiError(error) && error.code === 'NOT_FOUND' ? (
            <EmptyState title="Proveedor no encontrado" />
        ) : (
            <ErrorState onRetry={refetch} />
        )
    }

    const refundDue = account.returns.reduce((sum, r) => sum + r.refundDue, 0)

    return (
        <>
            <PageHeader
                title={account.supplierName}
                description={`${account.supplierTaxId} · ${
                    account.paymentTerms != null
                        ? `${account.paymentTerms} días de plazo`
                        : 'sin plazo'
                }`}
                actions={
                    canWrite && (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiOutlineCash />}
                            disabled={account.outstanding <= 0}
                            onClick={() => setPaying(true)}
                        >
                            Registrar pago
                        </Button>
                    )
                }
                onBack={() => navigate('/payables')}
            />
            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
                <StatCard
                    label="Se le debe"
                    value={formatCurrency(account.outstanding)}
                    tone="warning"
                />
                <StatCard
                    label="Vencido"
                    value={formatCurrency(account.overdue)}
                    tone={account.overdue > 0 ? 'danger' : 'neutral'}
                />
                <StatCard
                    label="Por reembolsar (devoluciones)"
                    value={formatCurrency(refundDue)}
                    tone={refundDue > 0 ? 'info' : 'neutral'}
                />
            </div>
            <Card className="mb-4">
                <h5 className="mb-4">Cuentas abiertas</h5>
                <PayablesTable payables={account.payables} />
            </Card>
            <Card className="mb-4">
                <h5 className="mb-4">Últimos pagos</h5>
                {account.payments.length === 0 ? (
                    <EmptyState className="!py-8" title="Sin pagos" />
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Número</Th>
                                <Th>Fecha</Th>
                                <Th>Medio</Th>
                                <Th>Referencia</Th>
                                <Th>Monto</Th>
                                <Th>Pagó</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {account.payments.map((payment) => (
                                <Tr key={payment.id}>
                                    <Td className="font-medium">
                                        {payment.number}
                                    </Td>
                                    <Td>{formatDatetime(payment.paidAt)}</Td>
                                    <Td>
                                        {PAYMENT_METHOD_LABELS[
                                            payment.paymentMethod
                                        ] ?? payment.paymentMethod}
                                    </Td>
                                    <Td>{payment.reference ?? '-'}</Td>
                                    <Td>{formatCurrency(payment.amount)}</Td>
                                    <Td>{payment.paidBy ?? '-'}</Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                )}
            </Card>
            <Card>
                <h5 className="mb-4">Devoluciones</h5>
                {account.returns.length === 0 ? (
                    <EmptyState className="!py-8" title="Sin devoluciones" />
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Número</Th>
                                <Th>Orden</Th>
                                <Th>Nota de crédito</Th>
                                <Th>Total</Th>
                                <Th>Descontado</Th>
                                <Th>Por reembolsar</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {account.returns.map((item) => (
                                <Tr key={item.id}>
                                    <Td>
                                        <Link
                                            className="font-medium text-primary-600 hover:underline"
                                            to={`/supplier-returns/${item.id}`}
                                        >
                                            {item.number ?? `#${item.id}`}
                                        </Link>
                                    </Td>
                                    <Td>{item.orderNumber ?? '-'}</Td>
                                    <Td>
                                        {item.supplierCreditNoteNumber ?? '-'}
                                    </Td>
                                    <Td>{formatCurrency(item.total)}</Td>
                                    <Td>
                                        {formatCurrency(item.creditedAmount)}
                                    </Td>
                                    <Td>{formatCurrency(item.refundDue)}</Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                )}
            </Card>
            <SupplierPaymentDialog
                open={paying}
                account={account}
                onClose={() => setPaying(false)}
            />
        </>
    )
}

export default SupplierAccountPage
