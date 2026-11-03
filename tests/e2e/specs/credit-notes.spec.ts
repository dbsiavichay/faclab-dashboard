import { test, expect } from '../support/test'
import { mockEmptyBackend } from '../fixtures/backend'
import { ACCESS_CODE, buildInvoice } from '../fixtures/invoicing'
import { mockPOS, openShift } from '../fixtures/pos'
import { buildDiscrepancy } from '../fixtures/sales'
import {
    ADMIN,
    INVOICING,
    POS,
    apiError,
    ok,
    paginated,
    type MockApi,
} from '../support/mockApi'
import { ROLE } from '@/constants/roles.constant'
import type { CreditNote } from '@features/invoicing'
import type { Page } from '@playwright/test'

const buildNote = (overrides: Partial<CreditNote> = {}): CreditNote => ({
    id: 31,
    status: 'AUTHORIZED',
    saleId: 501,
    refundId: 45,
    invoiceId: 'inv-1',
    documentId: 'doc-1',
    number: '001-001-000000012',
    accessCode: ACCESS_CODE,
    reason: 'Producto con defecto',
    total: 11.5,
    authorizedAt: '2026-11-02T15:04:20Z',
    rejectionReason: null,
    requestedAt: '2026-11-02T15:04:00Z',
    ...overrides,
})

const buildRefund = (creditNote: CreditNote | null, overrides = {}) => ({
    id: 45,
    number: 'D-001-000045',
    branchId: 1,
    terminalId: 11,
    originalSaleId: 501,
    shiftId: 42,
    refundDate: '2026-11-02T15:00:00Z',
    subtotal: 10,
    tax: 1.5,
    total: 11.5,
    reason: 'Producto con defecto',
    status: 'COMPLETED',
    refundedBy: 'Caja Uno',
    createdAt: '2026-11-02T15:00:00Z',
    creditNote,
    ...overrides,
})

const buildPosSale = (overrides = {}) => ({
    id: 501,
    number: 'V-001-000501',
    branchId: 1,
    emissionPointId: 1,
    terminalId: 11,
    customerId: 10,
    isFinalConsumer: false,
    shiftId: 42,
    status: 'INVOICED',
    saleDate: '2026-11-01T10:00:00Z',
    subtotal: 20,
    tax: 3,
    discount: 0,
    discountType: null,
    discountValue: 0,
    total: 23,
    paymentStatus: 'PAID',
    notes: null,
    createdBy: 'Caja Uno',
    parkedAt: null,
    parkReason: null,
    invoiceStatus: 'AUTHORIZED',
    createdAt: '2026-11-01T10:00:00Z',
    ...overrides,
})

/** The sale, its only item (2 units of 10.00) and its previous refunds */
const mockRefundableSale = (
    api: MockApi,
    sale = buildPosSale(),
    previous: object[] = []
) => {
    api.get(`${POS}/sales/:id`, () => ok(sale))
    api.get(`${POS}/sales/:id/items`, () =>
        ok([
            {
                id: 77,
                saleId: 501,
                productId: 1,
                quantity: 2,
                unitPrice: 10,
                discount: 0,
                taxCode: 'VAT_15',
                taxAmount: 3,
                subtotal: 20,
            },
        ])
    )
    api.get(`${POS}/products/:id`, () =>
        ok({ id: 1, name: 'Cemento Portland 50 kg' })
    )
    api.get(`${POS}/refunds`, ({ query }) => paginated(previous, query))
    api.get(`${POS}/refunds/:id`, () => ok(previous[0]))
}

const startRefund = async (page: Page) => {
    await page.goto('/pos')
    await page.getByRole('button', { name: 'Devolución' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('# de venta').fill('501')
    await dialog.getByRole('button', { name: 'Buscar' }).click()
    return dialog
}

test.describe('Nota de crédito desde el punto de venta', () => {
    test.beforeEach(async ({ signIn, api }) => {
        await signIn({ role: ROLE.ADMIN, username: 'gerente' })
        mockEmptyBackend(api)
        mockPOS(api, openShift())
    })

    test('anular una venta facturada es una devolución total con motivo', async ({
        page,
        api,
    }) => {
        mockRefundableSale(api)
        api.post(`${POS}/refunds`, () =>
            ok(buildRefund(null, { id: 46, status: 'PENDING', total: 23 }), 201)
        )
        api.post(`${POS}/refunds/:id/process`, () =>
            ok(buildRefund(buildNote({ status: 'PENDING' }), { total: 23 }))
        )

        const dialog = await startRefund(page)

        await expect(dialog).toContainText(
            'la devolución genera una nota de crédito electrónica'
        )
        const next = dialog.getByRole('button', { name: 'Continuar' })
        await dialog
            .getByRole('button', { name: 'Anular venta (devolver todo)' })
            .click()
        await expect(dialog).toContainText('$23,00')
        // Selected, but its credit note needs a reason
        await expect(next).toBeDisabled()
        await dialog
            .getByPlaceholder('Motivo (obligatorio: va en la nota de crédito)')
            .fill('Cliente desiste de la compra')
        await next.click()
        await dialog
            .getByRole('button', { name: 'Procesar Devolución' })
            .click()

        await expect(
            page.getByText('Devolución procesada correctamente')
        ).toBeVisible()
        expect(api.callsTo('POST', `${POS}/refunds`)[0].body).toEqual({
            originalSaleId: 501,
            items: [{ saleItemId: 77, quantity: 2 }],
            reason: 'Cliente desiste de la compra',
        })
    })

    test('solo deja devolver lo que queda de devoluciones anteriores', async ({
        page,
        api,
    }) => {
        mockRefundableSale(api, buildPosSale(), [
            {
                ...buildRefund(buildNote()),
                items: [{ originalSaleItemId: 77, quantity: 1 }],
            },
        ])

        const dialog = await startRefund(page)

        await expect(dialog).toContainText('x 1 (máx)')
    })

    test('sin poder leer el historial, ofrece todo: el core valida', async ({
        page,
        api,
    }) => {
        mockRefundableSale(api)
        api.get(`${POS}/refunds`, () => apiError(403, 'FORBIDDEN', 'forbidden'))

        const dialog = await startRefund(page)

        await expect(dialog).toContainText('x 2 (máx)')
    })

    test('una venta facturada a consumidor final no se puede devolver', async ({
        page,
        api,
    }) => {
        mockRefundableSale(
            api,
            buildPosSale({ customerId: null, isFinalConsumer: true })
        )

        const dialog = await startRefund(page)

        await expect(
            page.getByText('La factura a consumidor final no se anula').first()
        ).toBeVisible()
        await expect(dialog.getByPlaceholder('# de venta')).toBeVisible()
        expect(api.callsTo('POST', `${POS}/refunds`)).toHaveLength(0)
    })

    test('muestra por qué el core la rechaza', async ({ page, api }) => {
        mockRefundableSale(api)
        api.post(`${POS}/refunds`, () =>
            apiError(400, 'FINAL_CONSUMER_REFUND_NOT_ALLOWED', 'not allowed')
        )

        const dialog = await startRefund(page)
        await dialog
            .getByRole('button', { name: 'Anular venta (devolver todo)' })
            .click()
        await dialog
            .getByPlaceholder('Motivo (obligatorio: va en la nota de crédito)')
            .fill('Cambio')
        await dialog.getByRole('button', { name: 'Continuar' }).click()

        await expect(
            page.getByText('no se anula ni admite nota de crédito')
        ).toBeVisible()
    })

    test('una venta sin factura no pide motivo ni habla de nota de crédito', async ({
        page,
        api,
    }) => {
        mockRefundableSale(
            api,
            buildPosSale({ status: 'CONFIRMED', invoiceStatus: 'REJECTED' })
        )

        const dialog = await startRefund(page)
        await dialog.getByRole('button', { name: 'Devolver todo' }).click()

        await expect(dialog).not.toContainText('nota de crédito')
        await expect(
            dialog.getByRole('button', { name: 'Continuar' })
        ).toBeEnabled()
    })
})

test.describe('Nota de crédito en las devoluciones', () => {
    test.beforeEach(async ({ signIn, api }) => {
        await signIn()
        mockEmptyBackend(api)
    })

    test('muestra la autorizada con su número y descarga RIDE y XML', async ({
        page,
        api,
    }) => {
        api.get(`${POS}/refunds`, ({ query }) =>
            paginated([buildRefund(buildNote())], query)
        )

        await page.goto('/refunds')

        const row = page.getByRole('row').filter({ hasText: 'D-001-000045' })
        await expect(row).toContainText('Autorizada')
        await expect(row).toContainText('001-001-000000012')
        await expect(
            row.getByRole('button', {
                name: 'Descargar RIDE de la nota de crédito',
            })
        ).toBeVisible()
        await expect(
            row.getByRole('button', {
                name: 'Descargar XML de la nota de crédito',
            })
        ).toBeVisible()
        await expect(
            row.getByRole('button', { name: 'Volver a pedir' })
        ).toHaveCount(0)
    })

    test('muestra el motivo del rechazo y la vuelve a pedir', async ({
        page,
        api,
    }) => {
        let note = buildNote({
            status: 'REJECTED',
            documentId: null,
            rejectionReason: 'ERROR 68: Documento sustento',
        })
        api.get(`${POS}/refunds`, ({ query }) =>
            paginated([buildRefund(note)], query)
        )
        api.post(`${ADMIN}/credit-notes/:id/request-again`, () => {
            note = buildNote({
                status: 'PENDING',
                documentId: null,
                number: null,
                requestedAt: new Date().toISOString(),
            })
            return ok(note)
        })

        await page.goto('/refunds')
        const row = page.getByRole('row').filter({ hasText: 'D-001-000045' })
        await expect(row).toContainText('ERROR 68: Documento sustento')
        await row.getByRole('button', { name: 'Volver a pedir' }).click()

        await expect(
            page.getByText('Nota de crédito enviada de nuevo')
        ).toBeVisible()
        await expect(row).toContainText('En proceso')
        await expect(
            row.getByRole('button', { name: 'Volver a pedir' })
        ).toHaveCount(0)
    })

    test('una devolución sin nota de crédito lo deja claro', async ({
        page,
        api,
    }) => {
        api.get(`${POS}/refunds`, ({ query }) =>
            paginated([buildRefund(null)], query)
        )

        await page.goto('/refunds')

        const row = page.getByRole('row').filter({ hasText: 'D-001-000045' })
        await expect(row).toContainText('Completado')
        await expect(
            row.getByRole('button', { name: 'Volver a pedir' })
        ).toHaveCount(0)
    })
})

test.describe('Nota de crédito de una venta anulada', () => {
    const ATTENTION = '/sales/attention'
    const BY_SALE = `${INVOICING}/invoices/by-sale/:saleId`
    const cancelledSale = (customerId: number | null) => ({
        ...buildDiscrepancy().sale!,
        status: 'CANCELLED' as const,
        customerId,
    })

    test.beforeEach(async ({ signIn, api }) => {
        await signIn()
        mockEmptyBackend(api)
        api.get(BY_SALE, () => ok([buildInvoice()]))
    })

    test('la pide desde la discrepancia, con su motivo', async ({
        page,
        api,
    }) => {
        let discrepancy = buildDiscrepancy({
            kind: 'authorized_on_cancelled',
            invoiceId: 'inv-9',
            sale: cancelledSale(10),
        })
        api.get(`${ADMIN}/invoice-discrepancies`, ({ query }) =>
            paginated([discrepancy], query)
        )
        api.post(`${ADMIN}/invoice-discrepancies/:id/credit-note`, () => {
            const note = buildNote({
                status: 'PENDING',
                refundId: null,
                number: null,
                documentId: null,
                requestedAt: new Date().toISOString(),
            })
            discrepancy = { ...discrepancy, creditNote: note }
            return ok(note, 201)
        })

        await page.goto(ATTENTION)
        const row = page.getByRole('row').filter({ hasText: 'V-001-000501' })
        await row
            .getByRole('button', { name: 'Emitir nota de crédito' })
            .click()
        const dialog = page.getByRole('dialog')
        const save = dialog.getByRole('button', {
            name: 'Emitir nota de crédito',
        })
        await expect(save).toBeDisabled()
        await dialog.getByLabel('Motivo').fill('Venta anulada')
        await save.click()

        await expect(page.getByText('Nota de crédito solicitada')).toBeVisible()
        expect(
            api.callsTo(
                'POST',
                `${ADMIN}/invoice-discrepancies/:id/credit-note`
            )[0].body
        ).toEqual({ reason: 'Venta anulada' })
        await expect(row).toContainText('En proceso')
        await expect(
            row.getByRole('button', { name: 'Emitir nota de crédito' })
        ).toHaveCount(0)
    })

    test('a consumidor final no la ofrece y explica por qué', async ({
        page,
        api,
    }) => {
        api.get(`${ADMIN}/invoice-discrepancies`, ({ query }) =>
            paginated(
                [
                    buildDiscrepancy({
                        kind: 'authorized_on_cancelled',
                        invoiceId: 'inv-9',
                        sale: cancelledSale(null),
                    }),
                ],
                query
            )
        )

        await page.goto(ATTENTION)

        const row = page.getByRole('row').filter({ hasText: 'V-001-000501' })
        await expect(row).toContainText('no admite nota de crédito')
        await expect(
            row.getByRole('button', { name: 'Emitir nota de crédito' })
        ).toHaveCount(0)
        // It can still be taken by hand
        await expect(
            row.getByRole('button', { name: 'Marcar revisada' })
        ).toBeVisible()
    })
})

test.describe('Numeración de las notas de crédito', () => {
    test('ajusta el secuencial de las notas sin tocar el de las facturas', async ({
        page,
        api,
        signIn,
    }) => {
        await signIn()
        mockEmptyBackend(api)
        api.get(`${ADMIN}/branches`, ({ query }) =>
            paginated(
                [
                    {
                        id: 1,
                        establishmentCode: '001',
                        name: 'Matriz',
                        address: null,
                        isMain: true,
                        isActive: true,
                    },
                ],
                query
            )
        )
        api.get(`${ADMIN}/emission-points`, ({ query }) =>
            paginated(
                [
                    {
                        id: 1,
                        branchId: 1,
                        code: '001',
                        name: null,
                        isActive: true,
                    },
                ],
                query
            )
        )
        api.get(`${INVOICING}/sequences`, () =>
            ok([
                {
                    establishment: '001',
                    emissionPoint: '001',
                    docType: '01',
                    lastSequence: '000000041',
                    nextSequence: 42,
                },
                {
                    establishment: '001',
                    emissionPoint: '001',
                    docType: '04',
                    lastSequence: '000000003',
                    nextSequence: 4,
                },
            ])
        )
        api.put(`${INVOICING}/sequences/:establishment/:emissionPoint`, () =>
            ok({
                establishment: '001',
                emissionPoint: '001',
                docType: '04',
                lastSequence: '000000009',
                nextSequence: 10,
            })
        )

        await page.goto('/settings/sequences')
        const row = page.getByRole('row').filter({ hasText: '001' }).last()
        await expect(row).toContainText('000000041')

        await page.getByRole('combobox').first().click()
        await page.getByRole('option', { name: 'Nota de crédito' }).click()
        await expect(row).toContainText('000000003')
        await row.getByRole('button', { name: /Ajustar secuencial/ }).click()
        await page.getByRole('dialog').getByRole('spinbutton').fill('10')
        await page
            .getByRole('dialog')
            .getByRole('button', { name: 'Guardar' })
            .click()

        const [call] = api.callsTo(
            'PUT',
            `${INVOICING}/sequences/:establishment/:emissionPoint`
        )
        expect(call.body).toEqual({ nextSequence: 10, docType: '04' })
    })
})
