import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import EmptyState from '@/components/shared/EmptyState'
import { formatCurrency } from '@shared/lib/format'
import { formatQuantity } from '@shared/lib/quantity'
import type { Quote, QuoteItem } from '../model/types'

interface QuoteItemsProps {
    quote: Quote
    editable: boolean
    onAdd: () => void
    onEdit: (item: QuoteItem) => void
    onRemove: (item: QuoteItem) => void
}

export const QuoteItems = ({
    quote,
    editable,
    onAdd,
    onEdit,
    onRemove,
}: QuoteItemsProps) => {
    const columns: ColumnDef<QuoteItem>[] = [
        {
            header: 'Producto',
            accessorKey: 'productName',
            cell: (props) => (
                <div>
                    <p className="font-medium">
                        {props.row.original.productName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {props.row.original.productSku}
                    </p>
                </div>
            ),
        },
        {
            header: 'Cantidad',
            accessorKey: 'quantity',
            cell: (props) => {
                const item = props.row.original
                return (
                    <div>
                        <p>
                            {formatQuantity(item.quantity)}{' '}
                            {item.presentationName}
                        </p>
                        {item.unitFactor !== 1 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                = {formatQuantity(item.baseQuantity)} en
                                unidades base
                            </p>
                        )}
                    </div>
                )
            },
        },
        {
            header: 'Precio',
            accessorKey: 'unitPrice',
            cell: (props) => formatCurrency(props.row.original.unitPrice),
        },
        {
            header: 'Desc.',
            accessorKey: 'discount',
            cell: (props) =>
                props.row.original.discount > 0
                    ? `${props.row.original.discount}%`
                    : '—',
        },
        {
            header: 'Subtotal',
            accessorKey: 'subtotal',
            cell: (props) => (
                <span className="font-medium">
                    {formatCurrency(props.row.original.subtotal)}
                </span>
            ),
        },
    ]

    if (editable) {
        columns.push({
            header: 'Acciones',
            id: 'actions',
            cell: (props) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="plain"
                        aria-label={`Editar ${props.row.original.productName}`}
                        icon={<HiOutlinePencil />}
                        onClick={() => onEdit(props.row.original)}
                    />
                    <Button
                        size="sm"
                        variant="plain"
                        aria-label={`Quitar ${props.row.original.productName}`}
                        icon={<HiOutlineTrash />}
                        onClick={() => onRemove(props.row.original)}
                    />
                </div>
            ),
        })
    }

    return (
        <Card bodyClass="p-0">
            <div className="flex items-center justify-between p-4">
                <h5>Ítems</h5>
                {editable && (
                    <Button size="sm" icon={<HiPlus />} onClick={onAdd}>
                        Agregar ítem
                    </Button>
                )}
            </div>
            <DataTable
                columns={columns}
                data={quote.items}
                emptyState={
                    <EmptyState
                        className="!py-8"
                        title="Sin ítems"
                        description={
                            editable
                                ? 'Agrega los productos que el cliente quiere cotizar.'
                                : undefined
                        }
                    />
                }
            />
        </Card>
    )
}
