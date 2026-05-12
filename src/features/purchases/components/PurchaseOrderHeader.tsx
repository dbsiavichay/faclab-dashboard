import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import {
    HiOutlineArrowLeft,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineX,
} from 'react-icons/hi'
import { HiOutlinePaperAirplane, HiOutlineArchiveBox } from 'react-icons/hi2'
import {
    PURCHASE_ORDER_STATUS_LABELS,
    PURCHASE_ORDER_STATUS_CLASSES,
} from '../model/types'
import type { PurchaseOrder } from '../model/types'

type Props = {
    order: PurchaseOrder
    isDraft: boolean
    canReceive: boolean
    canCancel: boolean
    onBack: () => void
    onEdit: () => void
    onSend: () => void
    onDelete: () => void
    onReceive: () => void
    onCancel: () => void
}

export const PurchaseOrderHeader = ({
    order,
    isDraft,
    canReceive,
    canCancel,
    onBack,
    onEdit,
    onSend,
    onDelete,
    onReceive,
    onCancel,
}: Props) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button
                variant="plain"
                icon={<HiOutlineArrowLeft />}
                onClick={onBack}
            />
            <h3>Orden {order.orderNumber}</h3>
            <Badge
                content={PURCHASE_ORDER_STATUS_LABELS[order.status]}
                className={PURCHASE_ORDER_STATUS_CLASSES[order.status]}
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
                        color="blue-600"
                        icon={<HiOutlinePaperAirplane />}
                        onClick={onSend}
                    >
                        Enviar
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
            {canReceive && (
                <Button
                    size="sm"
                    variant="solid"
                    color="emerald-600"
                    icon={<HiOutlineArchiveBox />}
                    onClick={onReceive}
                >
                    Recibir Mercancía
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
