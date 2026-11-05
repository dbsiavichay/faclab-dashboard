import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import LabeledField from '@/components/shared/LabeledField'
import { formatCurrency } from '@shared/lib/format'
import { notifyError, notifySuccess } from '@shared/ui/notify'
import { useRequestDiscrepancyCreditNote } from '../hooks/useSales'
import type { InvoiceDiscrepancy } from '../model/types'

interface CreditNoteDiscrepancyDialogProps {
    discrepancy: InvoiceDiscrepancy | null
    onClose: () => void
}

const MESSAGES = {
    CREDIT_NOTE_ALREADY_REQUESTED: 'Esta venta ya tiene su nota de crédito.',
    FINAL_CONSUMER_CREDIT_NOTE_NOT_ALLOWED:
        'La factura a consumidor final no admite nota de crédito.',
    CREDIT_NOTE_NOT_APPLICABLE:
        'Esta discrepancia no tiene una factura autorizada que acreditar.',
    CREDIT_NOTES_DISABLED: 'Las notas de crédito están desactivadas.',
    INVOICING_DISABLED: 'La facturación electrónica está desactivada.',
}

/**
 * Pide la nota de crédito de toda la factura de una venta anulada, que el SRI
 * autorizó después: el stock y el dinero ya volvieron al anularla
 */
const CreditNoteDiscrepancyDialog = ({
    discrepancy,
    onClose,
}: CreditNoteDiscrepancyDialogProps) => {
    const [reason, setReason] = useState('')
    const request = useRequestDiscrepancyCreditNote()

    const close = () => {
        setReason('')
        onClose()
    }

    const handleSave = async () => {
        if (!discrepancy) return
        try {
            await request.mutateAsync({
                id: discrepancy.id,
                reason: reason.trim(),
            })
            notifySuccess(
                'Nota de crédito solicitada',
                'La discrepancia se resuelve cuando el SRI la autorice'
            )
            close()
        } catch (error) {
            notifyError(error, 'No se pudo pedir la nota de crédito', {
                messages: MESSAGES,
            })
        }
    }

    return (
        <Dialog
            isOpen={discrepancy !== null}
            width={500}
            contentLabel="Emitir nota de crédito"
            onClose={close}
            onRequestClose={close}
        >
            <h5 className="mb-2">Emitir nota de crédito</h5>
            {discrepancy?.sale && (
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Acredita toda la factura de la venta{' '}
                    {discrepancy.sale.number ?? `#${discrepancy.saleId}`} (
                    {formatCurrency(discrepancy.sale.total)}). Queda en la
                    bitácora.
                </p>
            )}
            <LabeledField label="Motivo">
                <Input
                    textArea
                    maxLength={300}
                    placeholder="Va en la nota de crédito que recibe el comprador"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </LabeledField>
            <div className="flex justify-end gap-2 mt-6">
                <Button variant="plain" onClick={close}>
                    Cancelar
                </Button>
                <Button
                    variant="solid"
                    disabled={reason.trim() === ''}
                    loading={request.isPending}
                    onClick={handleSave}
                >
                    Emitir nota de crédito
                </Button>
            </div>
        </Dialog>
    )
}

export default CreditNoteDiscrepancyDialog
