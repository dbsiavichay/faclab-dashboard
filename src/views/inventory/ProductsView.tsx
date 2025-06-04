import { useState, useEffect } from 'react'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import InventoryService, { Product } from '@/services/InventoryService'


const ProductsView = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    // Ya no necesitamos el estado de paginación

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await InventoryService.getProducts()
                const { data } = response.data
                setProducts(data)
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setLoading(false)
            }
        }
        
        fetchProducts()
    }, [])

    // Ya no necesitamos los manejadores de paginación

    const columns: ColumnDef<Product>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
            cell: (props) => {
                const { row } = props
                return <span>#{row.original.id}</span>
            },
        },
        {
            header: 'SKU',
            accessorKey: 'sku',
        },
        {
            header: 'Producto',
            accessorKey: 'name',
        },
        {
            header: 'Descripción',
            accessorKey: 'description',
            cell: (props) => {
                const { row } = props
                return <span className="text-sm">{row.original.description}</span>
            },
        },
    ]

    return (
        <Card className="mb-8">
            <div className="p-4">
                <h4 className="text-lg font-semibold mb-4">Listado de Productos</h4>
                <DataTable 
                    columns={columns}
                    data={products}
                    loading={loading}
                />
            </div>
        </Card>
    )
}

export default ProductsView