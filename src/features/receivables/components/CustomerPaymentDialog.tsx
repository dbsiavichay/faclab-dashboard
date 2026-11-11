import FormModal from '@/components/shared/FormModal'
import { formatCurrency } from '@shared/lib/format'
import { notifyError, notifySuccess } from '@shared/ui/notify'
import { useCreateCustomerPayment } from '../hooks/useReceivables'
import { RECEIVABLE_ERROR_MESSAGES, type CustomerAccount } from '../model/types'
import CustomerPaymentForm from './CustomerPaymentForm'

interface CustomerPaymentDialogProps {
    open: boolean
    account: CustomerAccount
    onClose: () => void
}

/** Un abono fuera de la caja: transferencia, cheque, efectivo en oficina */
const CustomerPaymentDialog = ({
    open,
    account,
    onClose,
}: CustomerPaymentDialogProps) => {
    const createPayment = useCreateCustomerPayment()

    return (
        <FormModal
            isOpen={open}
            title={`Abono de ${account.customerName}`}
            formId="customer-payment-form"
            isSubmitting={createPayment.isPending}
            width={560}
            onClose={onClose}
        >
            <CustomerPaymentForm
                formId="customer-payment-form"
                account={account}
                isSubmitting={createPayment.isPending}
                onSubmit={async (data) => {
                    try {
                        const payment = await createPayment.mutateAsync(data)
                        notifySuccess(
                            `Abono ${payment.number} registrado`,
                            formatCurrency(payment.amount)
                        )
                        onClose()
                    } catch (err) {
                        notifyError(err, 'No se pudo registrar el abono', {
                            messages: RECEIVABLE_ERROR_MESSAGES,
                        })
                    }
                }}
            />
        </FormModal>
    )
}

export default CustomerPaymentDialog
