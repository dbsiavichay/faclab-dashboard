import { Server, Response } from 'miragejs'
import { stockData } from '../data/stockData'

export default function stockFakeApi(server: Server) {
    server.get('/stock', (schema, request) => {
        const { productId, limit = '100', offset = '0' } = request.queryParams

        let filteredStock = [...stockData]

        // Filter by productId if provided
        if (productId) {
            const productIdNum = parseInt(productId)
            filteredStock = filteredStock.filter(
                (stock) => stock.productId === productIdNum
            )
        }

        // Apply pagination
        const limitNum = parseInt(limit)
        const offsetNum = parseInt(offset)
        const paginatedStock = filteredStock.slice(
            offsetNum,
            offsetNum + limitNum
        )

        return new Response(200, {}, paginatedStock)
    })
}
