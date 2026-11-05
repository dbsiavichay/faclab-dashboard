import Button from '@/components/ui/Button'
import StatusBadge from '@/components/shared/StatusBadge'
import { HiOutlineCode, HiOutlineDocumentDownload } from 'react-icons/hi'
import { notifyError, notifySuccess } from '@shared/ui/notify'
import { useCan } from '@/stores'
import { useInvoiceDocuments } from '../hooks/useInvoiceDocuments'
import { useRequestCreditNoteAgain } from '../hooks/useInvoicing'
import { INVOICING_ERROR_MESSAGES } from '../model/errors'
import {
    canAskAgain,
    CREDIT_NOTE_STATUS_LABELS,
    CREDIT_NOTE_STATUS_TONES,
    type CreditNote,
} from '../model/types'

interface CreditNoteCellProps {
    note: CreditNote
}

/**
 * Estado de una nota de crédito: su número y RIDE y XML una vez autorizada, el
 * motivo si el SRI la rechazó, y volver a pedirla si hace falta.
 */
const CreditNoteCell = ({ note }: CreditNoteCellProps) => {
    const canWrite = useCan('sale:write')
    const documents = useInvoiceDocuments()
    const askAgain = useRequestCreditNoteAgain()

    const document =
        note.status === 'AUTHORIZED' && note.documentId
            ? { id: note.documentId, accessCode: note.accessCode }
            : null

    const handleAskAgain = async () => {
        try {
            await askAgain.mutateAsync(note.id)
            notifySuccess(
                'Nota de crédito enviada de nuevo',
                'El resultado aparecerá aquí en unos momentos'
            )
        } catch (error) {
            notifyError(error, 'No se pudo volver a pedir la nota de crédito', {
                messages: INVOICING_ERROR_MESSAGES,
            })
        }
    }

    return (
        <div className="flex flex-col items-start gap-1">
            <StatusBadge tone={CREDIT_NOTE_STATUS_TONES[note.status]}>
                {CREDIT_NOTE_STATUS_LABELS[note.status]}
            </StatusBadge>
            {note.number && (
                <span className="font-mono text-xs">{note.number}</span>
            )}
            {note.rejectionReason && (
                <p
                    className="text-xs text-red-600 dark:text-red-400 line-clamp-2"
                    title={note.rejectionReason}
                >
                    {note.rejectionReason}
                </p>
            )}
            {document && (
                <div className="flex gap-1">
                    <Button
                        aria-label="Descargar RIDE de la nota de crédito"
                        icon={<HiOutlineDocumentDownload />}
                        loading={documents.isBusy(document, 'ride')}
                        size="xs"
                        title="Descargar RIDE (PDF)"
                        variant="plain"
                        onClick={() => documents.download(document, 'ride')}
                    />
                    <Button
                        aria-label="Descargar XML de la nota de crédito"
                        icon={<HiOutlineCode />}
                        loading={documents.isBusy(document, 'xml')}
                        size="xs"
                        title="Descargar XML autorizado"
                        variant="plain"
                        onClick={() => documents.download(document, 'xml')}
                    />
                </div>
            )}
            {canWrite && canAskAgain(note) && (
                <Button
                    size="xs"
                    loading={askAgain.isPending}
                    onClick={handleAskAgain}
                >
                    Volver a pedir
                </Button>
            )}
        </div>
    )
}

export default CreditNoteCell
