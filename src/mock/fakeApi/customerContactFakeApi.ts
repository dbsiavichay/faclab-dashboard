import { Server, Response } from 'miragejs'
import { customerContactData } from '../data/customerContactData'

export default function customerContactFakeApi(server: Server) {
    // GET /customers/:customer_id/contacts - Get contacts for a customer
    server.get('/customers/:customer_id/contacts', (schema, request) => {
        const customerId = parseInt(request.params.customer_id)
        const contacts = customerContactData.filter(
            (c) => c.customerId === customerId
        )

        return new Response(200, {}, { data: contacts })
    })

    // POST /customers/:customer_id/contacts - Create contact for customer
    server.post('/customers/:customer_id/contacts', (schema, request) => {
        const customerId = parseInt(request.params.customer_id)
        const attrs = JSON.parse(request.requestBody)

        // Validate required fields
        if (!attrs.name) {
            return new Response(
                400,
                {},
                { detail: 'El campo name es requerido' }
            )
        }

        const newContact = {
            id: customerContactData.length + 1,
            customerId: customerId,
            name: attrs.name,
            role: attrs.role || null,
            email: attrs.email || null,
            phone: attrs.phone || null,
        }

        customerContactData.push(newContact)

        return new Response(200, {}, newContact)
    })

    // GET /customer-contacts/:id - Get contact by ID
    server.get('/customer-contacts/:id', (schema, request) => {
        const id = parseInt(request.params.id)
        const contact = customerContactData.find((c) => c.id === id)

        if (!contact) {
            return new Response(404, {}, { detail: 'Contacto no encontrado' })
        }

        return new Response(200, {}, contact)
    })

    // PUT /customer-contacts/:id - Update contact
    server.put('/customer-contacts/:id', (schema, request) => {
        const id = parseInt(request.params.id)
        const attrs = JSON.parse(request.requestBody)
        const contactIndex = customerContactData.findIndex((c) => c.id === id)

        if (contactIndex === -1) {
            return new Response(404, {}, { detail: 'Contacto no encontrado' })
        }

        // Validate required fields
        if (!attrs.name) {
            return new Response(
                400,
                {},
                { detail: 'El campo name es requerido' }
            )
        }

        const updatedContact = {
            ...customerContactData[contactIndex],
            name: attrs.name,
            role: attrs.role || null,
            email: attrs.email || null,
            phone: attrs.phone || null,
        }

        customerContactData[contactIndex] = updatedContact

        return new Response(200, {}, updatedContact)
    })

    // DELETE /customer-contacts/:id - Delete contact
    server.delete('/customer-contacts/:id', (schema, request) => {
        const id = parseInt(request.params.id)
        const contactIndex = customerContactData.findIndex((c) => c.id === id)

        if (contactIndex === -1) {
            return new Response(404, {}, { detail: 'Contacto no encontrado' })
        }

        customerContactData.splice(contactIndex, 1)

        return new Response(204, {}, null)
    })
}
