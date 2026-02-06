import { useState } from 'react'
import { useMovements } from '@/hooks'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { ColumnDef } from '@tanstack/react-table'
import type { Movement } from '@/services/MovementService'
import MovementForm from './MovementForm'
import { HiOutlinePlus } from 'react-icons/hi'

const { Tr, Th, Td, THead, TBody } = Table

const MovementsView = () => {
    const [productId, setProductId] = useState<string>('')
    const [type, setType] = useState<string>('')
    const [fromDate, setFromDate] = useState<string>('')
    const [toDate, setToDate] = useState<string>('')
    const [limit, setLimit] = useState<string>('100')
    const [offset, setOffset] = useState<string>('0')
    const [formOpen, setFormOpen] = useState(false)

    const queryParams = {
        productId: productId ? parseInt(productId) : undefined,
        type: type ? (type as 'in' | 'out') : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        limit: limit ? parseInt(limit) : 100,
        offset: offset ? parseInt(offset) : 0,
    }

    const { data: movements = [], isLoading } = useMovements(queryParams)

    const columns: ColumnDef<Movement>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
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
            cell: ({ row }) => {
                return row.original.reason || (
                    <span className="text-gray-400 italic">Sin motivo</span>
                )
            },
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
        setLimit('100')
        setOffset('0')
    }

    const typeOptions = [
        { value: '', label: 'Todos' },
        { value: 'in', label: 'Entrada' },
        { value: 'out', label: 'Salida' },
    ]

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3>Movimientos</h3>
                <Button
                    variant="solid"
                    icon={<HiOutlinePlus />}
                    onClick={() => setFormOpen(true)}
                >
                    Nuevo Movimiento
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
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
                            value={typeOptions.find((opt) => opt.value === type)}
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
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Límite
                        </label>
                        <Input
                            type="number"
                            placeholder="100"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            min="1"
                            max="1000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Offset
                        </label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={offset}
                            onChange={(e) => setOffset(e.target.value)}
                            min="0"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Mostrando {movements.length} movimiento(s)
                        {productId && ` del producto ${productId}`}
                        {type && ` tipo ${type === 'in' ? 'entrada' : 'salida'}`}
                    </div>
                    <Button variant="plain" onClick={handleReset}>
                        Limpiar Filtros
                    </Button>
                </div>
            </Card>

            {/* Table */}
            <Card>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <div>Cargando...</div>
                    </div>
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                {columns.map((column) => (
                                    <Th key={column.header as string}>
                                        {column.header as string}
                                    </Th>
                                ))}
                            </Tr>
                        </THead>
                        <TBody>
                            {movements.length === 0 ? (
                                <Tr>
                                    <Td
                                        colSpan={columns.length}
                                        className="text-center py-8"
                                    >
                                        No hay movimientos registrados
                                    </Td>
                                </Tr>
                            ) : (
                                movements.map((movement) => (
                                    <Tr key={movement.id}>
                                        <Td>{movement.id}</Td>
                                        <Td>{movement.productId}</Td>
                                        <Td>
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    movement.type === 'in'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {movement.type === 'in'
                                                    ? 'Entrada'
                                                    : 'Salida'}
                                            </span>
                                        </Td>
                                        <Td>
                                            <span
                                                className={
                                                    movement.quantity > 0
                                                        ? 'text-green-600 font-semibold'
                                                        : 'text-red-600 font-semibold'
                                                }
                                            >
                                                {movement.quantity > 0
                                                    ? '+'
                                                    : ''}
                                                {movement.quantity}
                                            </span>
                                        </Td>
                                        <Td>
                                            {movement.reason || (
                                                <span className="text-gray-400 italic">
                                                    Sin motivo
                                                </span>
                                            )}
                                        </Td>
                                        <Td>
                                            {movement.date
                                                ? new Date(
                                                      movement.date
                                                  ).toLocaleString('es-ES', {
                                                      year: 'numeric',
                                                      month: '2-digit',
                                                      day: '2-digit',
                                                      hour: '2-digit',
                                                      minute: '2-digit',
                                                  })
                                                : '-'}
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </TBody>
                    </Table>
                )}
            </Card>

            {/* Form Modal */}
            <MovementForm open={formOpen} onClose={() => setFormOpen(false)} />
        </div>
    )
}

export default MovementsView
