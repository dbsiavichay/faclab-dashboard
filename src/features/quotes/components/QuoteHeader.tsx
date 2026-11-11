import {
    HiOutlineCheck,
    HiOutlineDownload,
    HiOutlineMail,
    HiOutlinePencil,
    HiOutlineRefresh,
    HiOutlineShoppingCart,
    HiOutlineTrash,
} from 'react-icons/hi'
import { HiOutlinePaperAirplane } from 'react-icons/hi2'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import {
    QUOTE_STATUS_LABELS,
    QUOTE_STATUS_TONES,
    type Quote,
} from '../model/types'

/** Lo que el usuario puede hacer con la cotización, por estado y permisos */
export interface QuoteAbilities {
    edit: boolean
    send: boolean
    email: boolean
    accept: boolean
    renew: boolean
    charge: boolean
}

interface Props {
    quote: Quote
    expired: boolean
    can: QuoteAbilities
    downloading: boolean
    onBack: () => void
    onEdit: () => void
    onDelete: () => void
    onSend: () => void
    onEmail: () => void
    onAccept: () => void
    onRenew: () => void
    onDownload: () => void
    onCharge: () => void
}

export const QuoteHeader = ({
    quote,
    expired,
    can,
    downloading,
    onBack,
    onEdit,
    onDelete,
    onSend,
    onEmail,
    onAccept,
    onRenew,
    onDownload,
    onCharge,
}: Props) => {
    // Past its date it is expired, though the worker may not have marked it yet
    const status = expired ? 'EXPIRED' : quote.status
    return (
        <PageHeader
            className="!mb-1"
            title={`Cotización ${quote.number ?? `#${quote.id}`}`}
            badge={
                <StatusBadge tone={QUOTE_STATUS_TONES[status]}>
                    {QUOTE_STATUS_LABELS[status]}
                </StatusBadge>
            }
            actions={
                <>
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<HiOutlineDownload />}
                        loading={downloading}
                        onClick={onDownload}
                    >
                        PDF
                    </Button>
                    {can.edit && (
                        <>
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<HiOutlinePencil />}
                                onClick={onEdit}
                            >
                                Editar
                            </Button>
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<HiOutlineTrash />}
                                onClick={onDelete}
                            >
                                Eliminar
                            </Button>
                        </>
                    )}
                    {can.send && (
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<HiOutlinePaperAirplane />}
                            onClick={onSend}
                        >
                            Marcar enviada
                        </Button>
                    )}
                    {can.email && (
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<HiOutlineMail />}
                            onClick={onEmail}
                        >
                            Enviar por correo
                        </Button>
                    )}
                    {can.accept && (
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<HiOutlineCheck />}
                            onClick={onAccept}
                        >
                            Aceptada
                        </Button>
                    )}
                    {can.renew && (
                        <Button
                            size="sm"
                            variant="solid"
                            icon={<HiOutlineRefresh />}
                            onClick={onRenew}
                        >
                            Renovar
                        </Button>
                    )}
                    {can.charge && (
                        <Button
                            size="sm"
                            variant="solid"
                            icon={<HiOutlineShoppingCart />}
                            onClick={onCharge}
                        >
                            Cobrar en el POS
                        </Button>
                    )}
                </>
            }
            onBack={onBack}
        />
    )
}
