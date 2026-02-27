import { useState } from 'react'
import { useStock } from '@/hooks'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { ColumnDef } from '@tanstack/react-table'
import type { Stock } from '@/services/StockService'

const { Tr, Th, Td, THead, TBody } = Table

const StockView = () => {
    const [productId, setProductId] = useState<string>('')
    const [limit, setLimit] = useState<string>('100')
    const [offset, setOffset] = useState<string>('0')

    const queryParams = {
        productId: productId ? parseInt(productId) : undefined,
        limit: limit ? parseInt(limit) : 100,
        offset: offset ? parseInt(offset) : 0,
    }

    const { data: stock = [], isLoading } = useStock(queryParams)

    const columns: ColumnDef<Stock>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
        },
        {
            header: 'ID Producto',
            accessorKey: 'productId',
        },
        {
            header: 'Cantidad',
            accessorKey: 'quantity',
            cell: ({ row }) => {
                const quantity = row.original.quantity
                return (
                    <span
                        className={
                            quantity < 50
                                ? 'text-red-600 font-semibold'
                                : quantity < 100
                                ? 'text-yellow-600 font-semibold'
                                : 'text-green-600 font-semibold'
                        }
                    >
                        {quantity}
                    </span>
                )
            },
        },
        {
            header: 'Ubicación',
            accessorKey: 'location',
            cell: ({ row }) => {
                return (
                    row.original.location || (
                        <span className="text-gray-400 italic">
                            Sin ubicación
                        </span>
                    )
                )
            },
        },
    ]

    const handleReset = () => {
        setProductId('')
        setLimit('100')
        setOffset('0')
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3>Stock</h3>
            </div>

            {/* Filters */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                            Límite
                        </label>
                        <Input
                            type="number"
                            placeholder="100"
                            value={limit}
                            min="1"
                            max="1000"
                            onChange={(e) => setLimit(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Desplazamiento
                        </label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={offset}
                            min="0"
                            onChange={(e) => setOffset(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <Button variant="plain" onClick={handleReset}>
                            Limpiar Filtros
                        </Button>
                    </div>
                </div>

                {/* Summary */}
                <div className="text-sm text-gray-600 mb-2">
                    Mostrando {stock.length} registro(s)
                    {productId && ` para el producto ${productId}`}
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
                            {stock.length === 0 ? (
                                <Tr>
                                    <Td
                                        colSpan={columns.length}
                                        className="text-center py-8"
                                    >
                                        No hay registros de stock
                                    </Td>
                                </Tr>
                            ) : (
                                stock.map((item) => (
                                    <Tr key={item.id}>
                                        <Td>{item.id}</Td>
                                        <Td>{item.productId}</Td>
                                        <Td>
                                            <span
                                                className={
                                                    item.quantity < 50
                                                        ? 'text-red-600 font-semibold'
                                                        : item.quantity < 100
                                                        ? 'text-yellow-600 font-semibold'
                                                        : 'text-green-600 font-semibold'
                                                }
                                            >
                                                {item.quantity}
                                            </span>
                                        </Td>
                                        <Td>
                                            {item.location || (
                                                <span className="text-gray-400 italic">
                                                    Sin ubicación
                                                </span>
                                            )}
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </TBody>
                    </Table>
                )}
            </Card>
        </div>
    )
}

export default StockView
