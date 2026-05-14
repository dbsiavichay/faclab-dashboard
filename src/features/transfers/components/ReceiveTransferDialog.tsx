import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import type { TransferItem } from '../model/types'

type Props = {
    open: boolean
    items: TransferItem[]
    getProductName: (productId: number) => string
    isPending: boolean
    onClose: () => void
    onReceive: () => void
}

export const ReceiveTransferDialog = ({
    open,
    items,
    getProductName,
    isPending,
    onClose,
    onReceive,
}: Props) => (
    <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose}>
        <h5 className="mb-4">Recibir Transferencia</h5>
        <p className="mb-4">
            ¿Está seguro que desea marcar esta transferencia como recibida? Se
            generarán los movimientos de inventario (salida del origen y entrada
            al destino).
        </p>
        {items.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium mb-2">
                    Movimientos que se generarán:
                </p>
                <ul className="text-sm space-y-1">
                    {items.map((item) => (
                        <li key={item.id}>
                            <span className="font-medium">
                                {getProductName(item.productId)}
                            </span>
                            :{' '}
                            <span className="text-red-600 dark:text-red-400">
                                -{item.quantity} (origen)
                            </span>
                            {' / '}
                            <span className="text-emerald-600 dark:text-emerald-400">
                                +{item.quantity} (destino)
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        )}
        <div className="flex justify-end gap-2">
            <Button variant="plain" onClick={onClose}>
                Cancelar
            </Button>
            <Button variant="solid" loading={isPending} onClick={onReceive}>
                Recibir
            </Button>
        </div>
    </Dialog>
)
