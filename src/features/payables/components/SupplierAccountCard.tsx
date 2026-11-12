import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import { PERMISSION } from '@/constants/permissions.constant'
import { useCan } from '@/stores'
import { formatCurrency } from '@shared/lib/format'
import { useSupplierAccount } from '../hooks/usePayables'
import Field from './Field'

interface SupplierAccountCardProps {
    supplierId: number
    paymentTerms?: number | null
}

/**
 * Lo que se le debe al proveedor (S5.7): su plazo (de su ficha), el saldo y
 * lo vencido, con un enlace a su cuenta para quien ve las cuentas por pagar.
 */
const SupplierAccountCard = ({
    supplierId,
    paymentTerms,
}: SupplierAccountCardProps) => {
    const canRead = useCan(PERMISSION.PAYABLE_READ)
    const { data: account } = useSupplierAccount(canRead ? supplierId : 0)
    if (!canRead) return null

    return (
        <Card>
            <div className="mb-2 flex items-center justify-between gap-2">
                <h5>Cuentas por pagar</h5>
                <Link
                    className="text-sm font-medium text-primary-600 hover:underline"
                    to={`/payables/suppliers/${supplierId}`}
                >
                    Ver cuenta
                </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <Field label="Plazo">
                    {paymentTerms != null ? `${paymentTerms} días` : 'Contado'}
                </Field>
                {account && (
                    <>
                        <Field label="Se le debe">
                            {formatCurrency(account.outstanding)}
                        </Field>
                        <Field label="Vencido">
                            <span
                                className={
                                    account.overdue > 0
                                        ? 'text-red-500'
                                        : undefined
                                }
                            >
                                {formatCurrency(account.overdue)}
                            </span>
                        </Field>
                    </>
                )}
            </div>
        </Card>
    )
}

export default SupplierAccountCard
