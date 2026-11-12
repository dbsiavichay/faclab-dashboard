import FormModal from '@/components/shared/FormModal'
import { formatCurrency } from '@shared/lib/format'
import { notifyError, notifySuccess } from '@shared/ui/notify'
import { useCreateSupplierPayment } from '../hooks/usePayables'
import { PAYABLE_ERROR_MESSAGES, type SupplierAccount } from '../model/types'
import SupplierPaymentForm from './SupplierPaymentForm'

interface SupplierPaymentDialogProps {
    open: boolean
    account: SupplierAccount
    onClose: () => void
}

/** Un pago al proveedor: transferencia, cheque, efectivo */
const SupplierPaymentDialog = ({
    open,
    account,
    onClose,
}: SupplierPaymentDialogProps) => {
    const createPayment = useCreateSupplierPayment()

    return (
        <FormModal
            isOpen={open}
            title={`Pago a ${account.supplierName}`}
            formId="supplier-payment-form"
            isSubmitting={createPayment.isPending}
            width={560}
            onClose={onClose}
        >
            <SupplierPaymentForm
                key={account.supplierId}
                formId="supplier-payment-form"
                account={account}
                isSubmitting={createPayment.isPending}
                onSubmit={async (data) => {
                    try {
                        const payment = await createPayment.mutateAsync(data)
                        notifySuccess(
                            `Pago ${payment.number} registrado`,
                            formatCurrency(payment.amount)
                        )
                        onClose()
                    } catch (err) {
                        notifyError(err, 'No se pudo registrar el pago', {
                            messages: PAYABLE_ERROR_MESSAGES,
                        })
                    }
                }}
            />
        </FormModal>
    )
}

export default SupplierPaymentDialog
