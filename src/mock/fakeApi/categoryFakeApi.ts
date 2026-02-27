import { Server, Response } from 'miragejs'
import { categoryData } from '../data/categoryData'

export default function categoryFakeApi(server: Server, apiPrefix: string) {
    // GET /categories - Obtener todas las categorías
    server.get(`${apiPrefix}/categories`, () => {
        return categoryData
    })

    // GET /categories/:id - Obtener una categoría por ID
    server.get(`${apiPrefix}/categories/:id`, (schema, request) => {
        const { id } = request.params
        const category = categoryData.find((item) => item.id === parseInt(id))

        if (category) {
            return category
        }

        return new Response(
            404,
            { some: 'header' },
            { detail: 'Categoría no encontrada' }
        )
    })

    // POST /categories - Crear categoría
    server.post(`${apiPrefix}/categories`, (schema, request) => {
        const attrs = JSON.parse(request.requestBody)
        const newCategory = {
            id: Math.max(...categoryData.map((c) => c.id)) + 1,
            ...attrs,
        }
        categoryData.push(newCategory)
        return newCategory
    })

    // PUT /categories/:id - Actualizar categoría
    server.put(`${apiPrefix}/categories/:id`, (schema, request) => {
        const { id } = request.params
        const attrs = JSON.parse(request.requestBody)
        const index = categoryData.findIndex((item) => item.id === parseInt(id))

        if (index !== -1) {
            categoryData[index] = {
                ...categoryData[index],
                ...attrs,
            }
            return categoryData[index]
        }

        return new Response(
            404,
            { some: 'header' },
            { detail: 'Categoría no encontrada' }
        )
    })

    // DELETE /categories/:id - Eliminar categoría
    server.delete(`${apiPrefix}/categories/:id`, (schema, request) => {
        const { id } = request.params
        const index = categoryData.findIndex((item) => item.id === parseInt(id))

        if (index !== -1) {
            categoryData.splice(index, 1)
            return new Response(204)
        }

        return new Response(
            404,
            { some: 'header' },
            { detail: 'Categoría no encontrada' }
        )
    })
}
