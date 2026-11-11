import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HiOutlineCash } from 'react-icons/hi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import StatusBadge from '@/components/shared/StatusBadge'
import ErrorState from '@/components/shared/ErrorState'
import EmptyState from '@/components/shared/EmptyState'
import { PERMISSION } from '@/constants/permissions.constant'
import { useCan } from '@/stores'
import { isApiError } from '@/utils/errors/ApiError'
import { formatCurrency } from '@shared/lib/format'
import CustomerPaymentDialog from '../components/CustomerPaymentDialog'
import OpenReceivablesTable from '../components/OpenReceivablesTable'
import StatementCard from '../components/StatementCard'
import { useCustomerAccount } from '../hooks/useReceivables'

/**
 * La cuenta de un cliente (S5.5): su crédito, sus cuentas abiertas y su estado
 * de cuenta. Quien administra la cartera registra aquí los abonos que no pasan
 * por la caja.
 */
const CustomerAccountPage = () => {
    const navigate = useNavigate()
    const customerId = Number(useParams().id ?? 0)
    const canWrite = useCan(PERMISSION.RECEIVABLE_WRITE)
    const {
        data: account,
        isLoading,
        error,
        refetch,
    } = useCustomerAccount(customerId)
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
            <EmptyState title="Cliente no encontrado" />
        ) : (
            <ErrorState onRetry={refetch} />
        )
    }

    return (
        <>
            <PageHeader
                title={account.customerName}
                description={`${account.customerTaxId} · ${
                    account.paymentTerms != null
                        ? `${account.paymentTerms} días de plazo`
                        : 'sin plazo'
                }`}
                badge={
                    account.hasCredit ? (
                        <StatusBadge tone="success">Con crédito</StatusBadge>
                    ) : (
                        <StatusBadge tone="neutral">Sin crédito</StatusBadge>
                    )
                }
                actions={
                    canWrite && (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiOutlineCash />}
                            disabled={account.outstanding <= 0}
                            onClick={() => setPaying(true)}
                        >
                            Registrar abono
                        </Button>
                    )
                }
                onBack={() => navigate('/receivables')}
            />
            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="Cupo"
                    value={
                        account.creditLimit != null
                            ? formatCurrency(account.creditLimit)
                            : 'Sin cupo'
                    }
                />
                <StatCard
                    label="Debe"
                    value={formatCurrency(account.outstanding)}
                    tone="warning"
                />
                <StatCard
                    label="Vencido"
                    value={formatCurrency(account.overdue)}
                    tone={account.overdue > 0 ? 'danger' : 'neutral'}
                />
                <StatCard
                    label="Disponible"
                    value={formatCurrency(account.available)}
                    tone="success"
                />
            </div>
            <Card className="mb-4">
                <h5 className="mb-4">Cuentas por cobrar</h5>
                <OpenReceivablesTable receivables={account.receivables} />
            </Card>
            <StatementCard customerId={customerId} />
            <CustomerPaymentDialog
                open={paying}
                account={account}
                onClose={() => setPaying(false)}
            />
        </>
    )
}

export default CustomerAccountPage
