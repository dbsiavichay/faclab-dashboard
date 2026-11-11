import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import { PERMISSION } from '@/constants/permissions.constant'
import { useCan } from '@/stores'
import { formatCurrency } from '@shared/lib/format'
import { useCustomerAccount } from '../hooks/useReceivables'
import Field from './Field'

interface CustomerCreditCardProps {
    customerId: number
    creditLimit?: number | null
    paymentTerms?: number | null
}

/**
 * El crédito del cliente (S5.5): su cupo y plazo (de su ficha), lo que debe y
 * lo que le queda, con un enlace a su estado de cuenta para quien ve la
 * cartera.
 */
const CustomerCreditCard = ({
    customerId,
    creditLimit,
    paymentTerms,
}: CustomerCreditCardProps) => {
    const canRead = useCan(PERMISSION.RECEIVABLE_READ)
    const { data: account } = useCustomerAccount(canRead ? customerId : 0)
    const hasLimit = creditLimit != null && creditLimit > 0

    return (
        <Card>
            <div className="mb-2 flex items-center justify-between gap-2">
                <h5>Crédito</h5>
                {canRead && (
                    <Link
                        className="text-sm font-medium text-primary-600 hover:underline"
                        to={`/receivables/customers/${customerId}`}
                    >
                        Estado de cuenta
                    </Link>
                )}
            </div>
            {!hasLimit && (
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    Sin cupo: no compra a crédito. Se asigna al editar el
                    cliente.
                </p>
            )}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Field label="Cupo">
                    {hasLimit ? formatCurrency(creditLimit) : 'Sin cupo'}
                </Field>
                <Field label="Plazo">
                    {paymentTerms != null ? `${paymentTerms} días` : 'Contado'}
                </Field>
                {account && (
                    <>
                        <Field label="Debe">
                            {formatCurrency(account.outstanding)}
                            {account.overdue > 0 && (
                                <span className="block text-xs text-red-500">
                                    {formatCurrency(account.overdue)} vencido
                                </span>
                            )}
                        </Field>
                        <Field label="Disponible">
                            {formatCurrency(account.available)}
                        </Field>
                    </>
                )}
            </div>
        </Card>
    )
}

export default CustomerCreditCard
