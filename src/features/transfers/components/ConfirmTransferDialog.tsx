import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import type { TransferItem } from '../model/types'

type Props = {
    open: boolean
    items: TransferItem[]
    getProductName: (productId: number) => string
    isPending: boolean
    onClose: () => void
    onConfirm: () => void
}

export const ConfirmTransferDialog = ({
    open,
    items,
    getProductName,
    isPending,
    onClose,
    onConfirm,
}: Props) => (
    <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose}>
        <h5 className="mb-4">Confirmar Transferencia</h5>
        <p className="mb-4">
            ¿Está seguro que desea confirmar esta transferencia? Se reservará el
            stock en la ubicación de origen.
        </p>
        {items.length > 0 ? (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium mb-2">Items a transferir:</p>
                <ul className="text-sm space-y-1">
                    {items.map((item) => (
                        <li key={item.id}>
                            <span className="font-medium">
                                {getProductName(item.productId)}
                            </span>
                            :{' '}
                            <span className="text-blue-600 dark:text-blue-400">
                                {item.quantity} unidades
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        ) : (
            <p className="mb-4 text-sm text-red-500">
                No se puede confirmar una transferencia sin items.
            </p>
        )}
        <div className="flex justify-end gap-2">
            <Button variant="plain" onClick={onClose}>
                Cancelar
            </Button>
            <Button
                variant="solid"
                loading={isPending}
                disabled={items.length === 0}
                onClick={onConfirm}
            >
                Confirmar
            </Button>
        </div>
    </Dialog>
)
