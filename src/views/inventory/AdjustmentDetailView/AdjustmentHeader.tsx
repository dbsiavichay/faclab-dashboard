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
    ADJUSTMENT_STATUS_LABELS,
    ADJUSTMENT_STATUS_CLASSES,
} from '@/services/AdjustmentService'
import type { Adjustment } from '@/services/AdjustmentService'

type Props = {
    adjustment: Adjustment
    isDraft: boolean
    onBack: () => void
    onEdit: () => void
    onConfirm: () => void
    onCancel: () => void
    onDelete: () => void
}

export const AdjustmentHeader = ({
    adjustment,
    isDraft,
    onBack,
    onEdit,
    onConfirm,
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
            <h3>Ajuste #{adjustment.id}</h3>
            <Badge
                content={ADJUSTMENT_STATUS_LABELS[adjustment.status]}
                className={ADJUSTMENT_STATUS_CLASSES[adjustment.status]}
            />
        </div>
        {isDraft && (
            <div className="flex gap-2">
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
                    icon={<HiOutlineX />}
                    onClick={onCancel}
                >
                    Cancelar
                </Button>
                <Button
                    size="sm"
                    variant="plain"
                    icon={<HiOutlineTrash />}
                    onClick={onDelete}
                >
                    Eliminar
                </Button>
            </div>
        )}
    </div>
)
