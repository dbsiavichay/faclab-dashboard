import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import LabeledField from '@/components/shared/LabeledField'
import { CustomerPaymentForm } from '@features/receivables'
import { formatCurrency } from '@shared/lib/format'
import { notifyError, notifySuccess } from '@shared/ui/notify'
import { POS_ERROR_MESSAGES } from '../model/errors'
import { usePOSStore } from '../store/usePOSStore'
import {
    usePOSCustomerAccount,
    usePOSCustomerPayment,
    usePOSCustomerSearch,
} from '../hooks/usePOS'

interface PaymentOnAccountDialogProps {
    isOpen: boolean
    onClose: () => void
}

const FORM_ID = 'pos-payment-on-account-form'

/**
 * Un abono del cliente en la caja (S5.5): va al turno abierto de la terminal y,
 * en efectivo, entra al resumen de caja. Toma el cliente del carrito, o se
 * busca por RUC o cédula.
 */
const PaymentOnAccountDialog = ({
    isOpen,
    onClose,
}: PaymentOnAccountDialogProps) => {
    const { customerId: cartCustomerId } = usePOSStore()
    const [taxId, setTaxId] = useState('')
    const [chosenId, setChosenId] = useState<number | null>(null)
    const customerId = chosenId ?? (cartCustomerId || null)
    const { data: found, isLoading: searching } = usePOSCustomerSearch(taxId)
    const { data: account, isLoading: loadingAccount } =
        usePOSCustomerAccount(customerId)
    const payment = usePOSCustomerPayment()

    const handleClose = () => {
        setTaxId('')
        setChosenId(null)
        onClose()
    }

    return (
        <Dialog
            isOpen={isOpen}
            contentLabel="Abono de cliente"
            width={560}
            overlayClassName="!z-[60]"
            onClose={handleClose}
        >
            <h4 className="mb-4">Abono de cliente</h4>

            <LabeledField label="Buscar por RUC o cédula">
                <Input
                    value={taxId}
                    placeholder="Al menos 5 dígitos"
                    onChange={(e) => setTaxId(e.target.value.trim())}
                />
            </LabeledField>
            {searching && <Spinner className="mt-2" />}
            {found && found.id !== customerId && (
                <Button
                    className="mt-2"
                    size="sm"
                    variant="twoTone"
                    onClick={() => setChosenId(found.id)}
                >
                    {found.name} ({found.taxId})
                </Button>
            )}

            <div className="mt-4">
                {loadingAccount && <Spinner />}
                {account && account.outstanding <= 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {account.customerName} no debe nada.
                    </p>
                )}
                {account && account.outstanding > 0 && (
                    <>
                        <p className="mb-2 font-medium">
                            {account.customerName}
                        </p>
                        <CustomerPaymentForm
                            key={account.customerId}
                            formId={FORM_ID}
                            account={account}
                            isSubmitting={payment.isPending}
                            onSubmit={async (data) => {
                                try {
                                    const saved = await payment.mutateAsync(
                                        data
                                    )
                                    notifySuccess(
                                        `Abono ${saved.number} registrado`,
                                        formatCurrency(saved.amount)
                                    )
                                    handleClose()
                                } catch (error) {
                                    notifyError(
                                        error,
                                        'No se pudo registrar el abono',
                                        { messages: POS_ERROR_MESSAGES }
                                    )
                                }
                            }}
                        />
                    </>
                )}
            </div>

            <div className="mt-6 flex gap-2">
                <Button block variant="default" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button
                    block
                    type="submit"
                    form={FORM_ID}
                    variant="solid"
                    loading={payment.isPending}
                    disabled={!account || account.outstanding <= 0}
                >
                    Registrar abono
                </Button>
            </div>
        </Dialog>
    )
}

export default PaymentOnAccountDialog
