import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import {
    HiOutlineArrowLeft,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineCheck,
    HiOutlineX,
} from 'react-icons/hi'
import {
    TRANSFER_STATUS_LABELS,
    TRANSFER_STATUS_CLASSES,
    type Transfer,
} from '../model/types'

type Props = {
    transfer: Transfer
    isDraft: boolean
    isConfirmed: boolean
    canCancel: boolean
    onBack: () => void
    onEdit: () => void
    onConfirm: () => void
    onReceive: () => void
    onCancel: () => void
    onDelete: () => void
}

export const TransferHeader = ({
    transfer,
    isDraft,
    isConfirmed,
    canCancel,
    onBack,
    onEdit,
    onConfirm,
    onReceive,
    onCancel,
    onDelete,
}: Props) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button
                variant="plain"
                icon={<HiOutlineArrowLeft />}
                onClick={onBack}
            />
            <h3>Transferencia #{transfer.id}</h3>
            <Badge
                content={TRANSFER_STATUS_LABELS[transfer.status]}
                className={TRANSFER_STATUS_CLASSES[transfer.status]}
            />
        </div>
        <div className="flex gap-2">
            {isDraft && (
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
                        variant="solid"
                        color="emerald-600"
                        icon={<HiOutlineCheck />}
                        onClick={onConfirm}
                    >
                        Confirmar
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
            {isConfirmed && (
                <Button
                    size="sm"
                    variant="solid"
                    color="emerald-600"
                    icon={<HiOutlineCheck />}
                    onClick={onReceive}
                >
                    Recibir
                </Button>
            )}
            {canCancel && (
                <Button
                    size="sm"
                    variant="plain"
                    icon={<HiOutlineX />}
                    onClick={onCancel}
                >
                    Cancelar
                </Button>
            )}
        </div>
    </div>
)
