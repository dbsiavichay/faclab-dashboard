import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import {
    ConfirmDialog,
    DeleteConfirmDialog,
    EmptyState,
    ErrorState,
} from '@/components/shared'
import { PERMISSION } from '@/constants/permissions.constant'
import { useCan } from '@/stores'
import { isApiError } from '@/utils/errors/ApiError'
import { notifyError, notifySuccess } from '@shared/ui/notify'
import { saveFile } from '@shared/lib/saveFile'
import { useQuote, useQuoteMutations } from '../hooks/useQuotes'
import { downloadQuotePdf } from '../api/client'
import { quoteAbilities } from '../model/abilities'
import { localDay, QUOTE_ERROR_MESSAGES, type QuoteItem } from '../model/types'
import { QuoteHeader } from '../components/QuoteHeader'
import { QuoteInfo } from '../components/QuoteInfo'
import { QuoteItems } from '../components/QuoteItems'
import { QuoteUpdateForm } from '../components/QuoteForm'
import {
    QuoteItemCreateForm,
    QuoteItemUpdateForm,
} from '../components/QuoteItemForm'
import { EmailQuoteDialog, RenewQuoteDialog } from '../components/QuoteDialogs'

const QUOTES_PATH = '/quotes'

type Dialog =
    | 'edit'
    | 'delete'
    | 'send'
    | 'accept'
    | 'email'
    | 'renew'
    | 'addItem'
    | null

const QuoteDetailPage = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const quoteId = Number(id) || 0
    const canWrite = useCan(PERMISSION.SALE_WRITE)
    const canCharge = useCan(PERMISSION.POS_OPERATE)
    const quote = useQuote(quoteId)
    const mutations = useQuoteMutations(quoteId)
    const [dialog, setDialog] = useState<Dialog>(null)
    const [editingItem, setEditingItem] = useState<QuoteItem | null>(null)
    const [removingItem, setRemovingItem] = useState<QuoteItem | null>(null)
    const [downloading, setDownloading] = useState(false)

    const close = () => setDialog(null)

    /** Runs a mutation, says so and closes its dialog; the error stays open */
    const run = async (
        action: () => Promise<unknown>,
        success: string,
        failure: string
    ) => {
        try {
            await action()
            notifySuccess(success)
            setDialog(null)
            setEditingItem(null)
            setRemovingItem(null)
        } catch (error) {
            notifyError(error, failure, { messages: QUOTE_ERROR_MESSAGES })
        }
    }

    if (quote.isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Spinner size={40} />
            </div>
        )
    }

    if (!quote.data) {
        return quote.error &&
            !(isApiError(quote.error) && quote.error.code === 'NOT_FOUND') ? (
            <ErrorState error={quote.error} onRetry={() => quote.refetch()} />
        ) : (
            <EmptyState
                className="min-h-[24rem]"
                title="Cotización no encontrada"
                action={
                    <Button
                        size="sm"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate(QUOTES_PATH)}
                    >
                        Volver a Cotizaciones
                    </Button>
                }
            />
        )
    }

    const data = quote.data
    const can = quoteAbilities(data, localDay(), { canWrite, canCharge })

    const download = async () => {
        setDownloading(true)
        try {
            // Content-Disposition is not exposed over CORS: named here
            saveFile(
                await downloadQuotePdf(data.id),
                `cotizacion-${data.number ?? data.id}.pdf`
            )
        } catch (error) {
            notifyError(error, 'No se pudo descargar el PDF')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <QuoteHeader
                quote={data}
                expired={can.expired}
                can={can}
                downloading={downloading}
                onBack={() => navigate(QUOTES_PATH)}
                onEdit={() => setDialog('edit')}
                onDelete={() => setDialog('delete')}
                onSend={() => setDialog('send')}
                onEmail={() => setDialog('email')}
                onAccept={() => setDialog('accept')}
                onRenew={() => setDialog('renew')}
                onDownload={download}
                onCharge={() => navigate(`/pos?quote=${data.id}`)}
            />

            <QuoteInfo quote={data} />

            <QuoteItems
                quote={data}
                editable={can.edit}
                onAdd={() => setDialog('addItem')}
                onEdit={setEditingItem}
                onRemove={setRemovingItem}
            />

            <QuoteUpdateForm
                open={dialog === 'edit'}
                quote={data}
                isSubmitting={mutations.update.isPending}
                onClose={close}
                onSubmit={(values) =>
                    run(
                        () =>
                            mutations.update.mutateAsync({
                                customerId: values.customerId,
                                validUntil: values.validUntil,
                                notes: values.notes || null,
                            }),
                        'Cotización actualizada',
                        'No se pudo actualizar la cotización'
                    )
                }
            />

            <QuoteItemCreateForm
                open={dialog === 'addItem'}
                isSubmitting={mutations.addItem.isPending}
                onClose={close}
                onSubmit={(values) =>
                    run(
                        () =>
                            mutations.addItem.mutateAsync({
                                productId: values.productId,
                                presentationId: values.presentationId ?? null,
                                quantity: values.quantity,
                                discount: values.discount,
                            }),
                        'Ítem agregado',
                        'No se pudo agregar el ítem'
                    )
                }
            />

            {editingItem && (
                <QuoteItemUpdateForm
                    open
                    item={editingItem}
                    isSubmitting={mutations.updateItem.isPending}
                    onClose={() => setEditingItem(null)}
                    onSubmit={(values) =>
                        run(
                            () =>
                                mutations.updateItem.mutateAsync({
                                    itemId: editingItem.id,
                                    data: values,
                                }),
                            'Ítem actualizado',
                            'No se pudo actualizar el ítem'
                        )
                    }
                />
            )}

            <DeleteConfirmDialog
                isOpen={removingItem !== null}
                itemName={removingItem?.productName ?? undefined}
                isDeleting={mutations.removeItem.isPending}
                onClose={() => setRemovingItem(null)}
                onConfirm={() =>
                    removingItem &&
                    run(
                        () => mutations.removeItem.mutateAsync(removingItem.id),
                        'Ítem quitado',
                        'No se pudo quitar el ítem'
                    )
                }
            />

            <DeleteConfirmDialog
                isOpen={dialog === 'delete'}
                itemName={`la cotización ${data.number}`}
                isDeleting={mutations.remove.isPending}
                onClose={close}
                onConfirm={() =>
                    run(
                        async () => {
                            await mutations.remove.mutateAsync()
                            navigate(QUOTES_PATH)
                        },
                        'Cotización eliminada',
                        'No se pudo eliminar la cotización'
                    )
                }
            />

            <ConfirmDialog
                isOpen={dialog === 'send'}
                title="Marcar como enviada"
                confirmText="Marcar enviada"
                onClose={close}
                onCancel={close}
                onConfirm={() =>
                    run(
                        () => mutations.send.mutateAsync(),
                        'Cotización enviada',
                        'No se pudo marcar como enviada'
                    )
                }
            >
                <p>
                    La cotización se entregó al cliente impresa o a mano. Ya no
                    se podrán cambiar sus ítems.
                </p>
            </ConfirmDialog>

            <ConfirmDialog
                isOpen={dialog === 'accept'}
                title="Aceptada por el cliente"
                confirmText="Marcar aceptada"
                onClose={close}
                onCancel={close}
                onConfirm={() =>
                    run(
                        () => mutations.accept.mutateAsync(),
                        'Cotización aceptada',
                        'No se pudo marcar como aceptada'
                    )
                }
            >
                <p>
                    El cliente aceptó la cotización. Se cobra en el POS mientras
                    esté vigente.
                </p>
            </ConfirmDialog>

            <EmailQuoteDialog
                open={dialog === 'email'}
                quote={data}
                isSubmitting={mutations.email.isPending}
                onClose={close}
                onSubmit={(values) =>
                    run(
                        () => mutations.email.mutateAsync(values.to),
                        `Cotización enviada a ${values.to}`,
                        'No se pudo enviar la cotización'
                    )
                }
            />

            <RenewQuoteDialog
                open={dialog === 'renew'}
                quote={data}
                isSubmitting={mutations.renew.isPending}
                onClose={close}
                onSubmit={(values) =>
                    run(
                        () => mutations.renew.mutateAsync(values.validUntil),
                        'Cotización renovada',
                        'No se pudo renovar la cotización'
                    )
                }
            />
        </div>
    )
}

export default QuoteDetailPage
