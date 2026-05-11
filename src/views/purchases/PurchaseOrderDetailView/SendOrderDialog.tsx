import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { formatCurrency } from '@shared/lib/format'
import type {
    PurchaseOrder,
    PurchaseOrderItem,
} from '@/services/PurchaseOrderService'

type Props = {
    open: boolean
    items: PurchaseOrderItem[]
    order: PurchaseOrder
    getProductName: (productId: number) => string
    isPending: boolean
    onClose: () => void
    onSend: () => void
}

export const SendOrderDialog = ({
    open,
    items,
    order,
    getProductName,
    isPending,
    onClose,
    onSend,
}: Props) => (
    <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose}>
        <h5 className="mb-4">Enviar Orden de Compra</h5>
        <p className="mb-4">
            ¿Está seguro que desea enviar esta orden al proveedor? Una vez
            enviada, los items no podrán ser modificados.
        </p>
        {items.length > 0 ? (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium mb-2">Items de la orden:</p>
                <ul className="text-sm space-y-1">
                    {items.map((item) => (
                        <li key={item.id}>
                            <span className="font-medium">
                                {getProductName(item.productId)}
                            </span>
                            :{' '}
                            <span className="text-blue-600 dark:text-blue-400">
                                {item.quantityOrdered} uds. x{' '}
                                {formatCurrency(item.unitCost)}
                            </span>
                        </li>
                    ))}
                </ul>
                <p className="mt-2 pt-2 border-t dark:border-gray-600 font-medium">
                    Total: {formatCurrency(order.total)}
                </p>
            </div>
        ) : (
            <p className="mb-4 text-sm text-red-500">
                No se puede enviar una orden sin items.
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
                onClick={onSend}
            >
                Enviar
            </Button>
        </div>
    </Dialog>
)
