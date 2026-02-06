import { Server, Response } from 'miragejs'
import { customerData } from '../data/customerData'

export default function customerFakeApi(server: Server) {
    // GET /customers - Get all customers
    server.get('/customers', () => {
        return new Response(200, {}, { data: customerData })
    })

    // GET /customers/:id - Get customer by ID
    server.get('/customers/:id', (schema, request) => {
        const id = parseInt(request.params.id)
        const customer = customerData.find((c) => c.id === id)

        if (!customer) {
            return new Response(404, {}, { detail: 'Cliente no encontrado' })
        }

        return new Response(200, {}, customer)
    })

    // GET /customers/search/by-tax-id - Search by tax ID
    server.get('/customers/search/by-tax-id', (schema, request) => {
        const taxId = request.queryParams.tax_id

        if (!taxId) {
            return new Response(
                400,
                {},
                { detail: 'El parámetro tax_id es requerido' }
            )
        }

        const customer = customerData.find((c) => c.taxId === taxId)

        if (!customer) {
            return new Response(
                404,
                {},
                { detail: 'Cliente no encontrado con ese Tax ID' }
            )
        }

        return new Response(200, {}, customer)
    })

    // POST /customers - Create customer
    server.post('/customers', (schema, request) => {
        const attrs = JSON.parse(request.requestBody)

        // Validate required fields
        if (!attrs.name || !attrs.taxId || !attrs.taxType) {
            return new Response(
                400,
                {},
                {
                    detail: 'Los campos name, taxId y taxType son requeridos',
                }
            )
        }

        // Check if taxId already exists
        const existingCustomer = customerData.find(
            (c) => c.taxId === attrs.taxId
        )
        if (existingCustomer) {
            return new Response(
                400,
                {},
                { detail: 'Ya existe un cliente con ese Tax ID' }
            )
        }

        // Validate taxType
        if (![1, 2, 3, 4].includes(attrs.taxType)) {
            return new Response(
                400,
                {},
                { detail: 'taxType debe ser 1, 2, 3 o 4' }
            )
        }

        const newCustomer = {
            id: customerData.length + 1,
            name: attrs.name,
            taxId: attrs.taxId,
            taxType: attrs.taxType,
            email: attrs.email || null,
            phone: attrs.phone || null,
            address: attrs.address || null,
            city: attrs.city || null,
            state: attrs.state || null,
            country: attrs.country || null,
            creditLimit: attrs.creditLimit || null,
            paymentTerms: attrs.paymentTerms || null,
            isActive: attrs.isActive !== undefined ? attrs.isActive : true,
        }

        customerData.push(newCustomer)

        return new Response(200, {}, newCustomer)
    })

    // PUT /customers/:id - Update customer
    server.put('/customers/:id', (schema, request) => {
        const id = parseInt(request.params.id)
        const attrs = JSON.parse(request.requestBody)
        const customerIndex = customerData.findIndex((c) => c.id === id)

        if (customerIndex === -1) {
            return new Response(404, {}, { detail: 'Cliente no encontrado' })
        }

        // Check if taxId is being changed and already exists
        if (
            attrs.taxId &&
            attrs.taxId !== customerData[customerIndex].taxId
        ) {
            const existingCustomer = customerData.find(
                (c) => c.taxId === attrs.taxId && c.id !== id
            )
            if (existingCustomer) {
                return new Response(
                    400,
                    {},
                    { detail: 'Ya existe otro cliente con ese Tax ID' }
                )
            }
        }

        // Validate taxType if provided
        if (attrs.taxType && ![1, 2, 3, 4].includes(attrs.taxType)) {
            return new Response(
                400,
                {},
                { detail: 'taxType debe ser 1, 2, 3 o 4' }
            )
        }

        const updatedCustomer = {
            ...customerData[customerIndex],
            ...attrs,
        }

        customerData[customerIndex] = updatedCustomer

        return new Response(200, {}, updatedCustomer)
    })

    // DELETE /customers/:id - Delete customer
    server.delete('/customers/:id', (schema, request) => {
        const id = parseInt(request.params.id)
        const customerIndex = customerData.findIndex((c) => c.id === id)

        if (customerIndex === -1) {
            return new Response(404, {}, { detail: 'Cliente no encontrado' })
        }

        customerData.splice(customerIndex, 1)

        return new Response(204, {}, null)
    })

    // POST /customers/:id/activate - Activate customer
    server.post('/customers/:id/activate', (schema, request) => {
        const id = parseInt(request.params.id)
        const customerIndex = customerData.findIndex((c) => c.id === id)

        if (customerIndex === -1) {
            return new Response(404, {}, { detail: 'Cliente no encontrado' })
        }

        customerData[customerIndex].isActive = true

        return new Response(200, {}, customerData[customerIndex])
    })

    // POST /customers/:id/deactivate - Deactivate customer
    server.post('/customers/:id/deactivate', (schema, request) => {
        const id = parseInt(request.params.id)
        const customerIndex = customerData.findIndex((c) => c.id === id)

        if (customerIndex === -1) {
            return new Response(404, {}, { detail: 'Cliente no encontrado' })
        }

        customerData[customerIndex].isActive = false

        return new Response(200, {}, customerData[customerIndex])
    })
}
