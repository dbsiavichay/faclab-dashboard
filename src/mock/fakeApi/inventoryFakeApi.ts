import { Server, Response } from 'miragejs'
import { productData } from '../data/productData'

export default function inventoryFakeApi(server: Server, apiPrefix: string) {
    // Obtener todos los productos sin paginación
    server.get(`${apiPrefix}/products`, () => {
        return {
            data: productData
        }
    })

    // Obtener un producto por ID
    server.get(`${apiPrefix}/products/:id`, (schema, request) => {
        const { id } = request.params
        const product = productData.find(item => item.id === parseInt(id))
        
        if (product) {
            return { data: product }
        }
        
        return new Response(
            404,
            { some: 'header' },
            { message: 'Producto no encontrado' }
        )
    })
}