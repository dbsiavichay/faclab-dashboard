import { Server, Response } from 'miragejs'
import { productData } from '../data/productData'

export default function inventoryFakeApi(server: Server, apiPrefix: string) {
    // GET /products - Obtener todos los productos
    server.get(`${apiPrefix}/products`, () => {
        return {
            data: productData
        }
    })

    // GET /products/:id - Obtener un producto por ID
    server.get(`${apiPrefix}/products/:id`, (schema, request) => {
        const { id } = request.params
        const product = productData.find(item => item.id === parseInt(id))

        if (product) {
            return product // Retorna el producto directo, no wrapped
        }

        return new Response(
            404,
            { some: 'header' },
            { detail: 'Producto no encontrado' }
        )
    })

    // POST /products - Crear producto
    server.post(`${apiPrefix}/products`, (schema, request) => {
        const attrs = JSON.parse(request.requestBody)
        const newProduct = {
            id: Math.max(...productData.map(p => p.id)) + 1,
            ...attrs
        }
        productData.push(newProduct)
        return newProduct
    })

    // PUT /products/:id - Actualizar producto
    server.put(`${apiPrefix}/products/:id`, (schema, request) => {
        const { id } = request.params
        const attrs = JSON.parse(request.requestBody)
        const index = productData.findIndex(item => item.id === parseInt(id))

        if (index !== -1) {
            productData[index] = {
                ...productData[index],
                ...attrs
            }
            return productData[index]
        }

        return new Response(
            404,
            { some: 'header' },
            { detail: 'Producto no encontrado' }
        )
    })

    // DELETE /products/:id - Eliminar producto
    server.delete(`${apiPrefix}/products/:id`, (schema, request) => {
        const { id } = request.params
        const index = productData.findIndex(item => item.id === parseInt(id))

        if (index !== -1) {
            productData.splice(index, 1)
            return new Response(204)
        }

        return new Response(
            404,
            { some: 'header' },
            { detail: 'Producto no encontrado' }
        )
    })
}
