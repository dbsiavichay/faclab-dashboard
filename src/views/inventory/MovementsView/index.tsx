import { useState } from 'react'
import { useMovements } from '@/hooks'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Movement } from '@/services/MovementService'
import MovementForm from './MovementForm'
import { HiOutlinePlus } from 'react-icons/hi'

const MovementsView = () => {
    const [productId, setProductId] = useState<string>('')
    const [type, setType] = useState<string>('')
    const [fromDate, setFromDate] = useState<string>('')
    const [toDate, setToDate] = useState<string>('')
    const [formOpen, setFormOpen] = useState(false)

    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const offset = (pageIndex - 1) * pageSize

    const queryParams = {
        productId: productId ? parseInt(productId) : undefined,
        type: type ? (type as 'in' | 'out') : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        limit: pageSize,
        offset,
    }

    const { data, isLoading } = useMovements(queryParams)
    const movements = data?.items ?? []
    const total = data?.pagination?.total ?? 0

    const columns: ColumnDef<Movement>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
            cell: (props) => {
                const { row } = props
                return <span className="font-medium">#{row.original.id}</span>
            },
        },
        {
            header: 'ID Producto',
            accessorKey: 'productId',
        },
        {
            header: 'Tipo',
            accessorKey: 'type',
            cell: ({ row }) => {
                const type = row.original.type
                return (
                    <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                            type === 'in'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {type === 'in' ? 'Entrada' : 'Salida'}
                    </span>
                )
            },
        },
        {
            header: 'Cantidad',
            accessorKey: 'quantity',
            cell: ({ row }) => {
                const quantity = row.original.quantity
                return (
                    <span
                        className={
                            quantity > 0
                                ? 'text-green-600 font-semibold'
                                : 'text-red-600 font-semibold'
                        }
                    >
                        {quantity > 0 ? '+' : ''}
                        {quantity}
                    </span>
                )
            },
        },
        {
            header: 'Motivo',
            accessorKey: 'reason',
            cell: ({ row }) =>
                row.original.reason || (
                    <span className="text-gray-400 italic">Sin motivo</span>
                ),
        },
        {
            header: 'Fecha',
            accessorKey: 'date',
            cell: ({ row }) => {
                const date = row.original.date
                if (!date) return '-'
                return new Date(date).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                })
            },
        },
    ]

    const handleReset = () => {
        setProductId('')
        setType('')
        setFromDate('')
        setToDate('')
        setPageIndex(1)
    }

    const typeOptions = [
        { value: '', label: 'Todos' },
        { value: 'in', label: 'Entrada' },
        { value: 'out', label: 'Salida' },
    ]

    return (
        <>
            <Card className="mb-4">
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                ID Producto
                            </label>
                            <Input
                                type="number"
                                placeholder="Filtrar por producto"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tipo
                            </label>
                            <Select
                                value={typeOptions.find(
                                    (opt) => opt.value === type
                                )}
                                options={typeOptions}
                                onChange={(option) =>
                                    setType(option?.value || '')
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Desde
                            </label>
                            <Input
                                type="datetime-local"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Hasta
                            </label>
                            <Input
                                type="datetime-local"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button variant="plain" onClick={handleReset}>
                                Limpiar Filtros
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h4 className="text-lg font-semibold">
                                Movimientos
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestiona los movimientos de inventario
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiOutlinePlus />}
                            onClick={() => setFormOpen(true)}
                        >
                            Nuevo Movimiento
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={movements}
                        loading={isLoading}
                        pagingData={{ total, pageIndex, pageSize }}
                        onPaginationChange={setPageIndex}
                        onSelectChange={(size) => {
                            setPageSize(size)
                            setPageIndex(1)
                        }}
                    />
                </div>
            </Card>

            <MovementForm open={formOpen} onClose={() => setFormOpen(false)} />
        </>
    )
}

export default MovementsView
