import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { getDifferenceColor } from './utils'
import type { AdjustmentItem } from '../model/types'

type Props = {
    open: boolean
    itemsWithDifference: AdjustmentItem[]
    getProductName: (productId: number) => string
    isPending: boolean
    onClose: () => void
    onConfirm: () => void
}

export const ConfirmAdjustmentDialog = ({
    open,
    itemsWithDifference,
    getProductName,
    isPending,
    onClose,
    onConfirm,
}: Props) => (
    <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose}>
        <h5 className="mb-4">Confirmar Ajuste</h5>
        <p className="mb-4">
            ¿Está seguro que desea confirmar este ajuste? Se generarán
            movimientos de inventario automáticos.
        </p>
        {itemsWithDifference.length > 0 ? (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium mb-2">
                    Movimientos que se generarán:
                </p>
                <ul className="text-sm space-y-1">
                    {itemsWithDifference.map((item) => (
                        <li key={item.id}>
                            <span className="font-medium">
                                {getProductName(item.productId)}
                            </span>
                            :{' '}
                            <span
                                className={getDifferenceColor(item.difference)}
                            >
                                {item.difference > 0
                                    ? `+${item.difference} (entrada)`
                                    : `${item.difference} (salida)`}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        ) : (
            <p className="mb-4 text-sm text-gray-500">
                No se generarán movimientos (todas las diferencias son 0).
            </p>
        )}
        <div className="flex justify-end gap-2">
            <Button variant="plain" onClick={onClose}>
                Cancelar
            </Button>
            <Button variant="solid" loading={isPending} onClick={onConfirm}>
                Confirmar
            </Button>
        </div>
    </Dialog>
)
