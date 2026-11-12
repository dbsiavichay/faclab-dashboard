import { test, expect } from '../support/test'
import {
    draftReturn,
    receivedItem,
    receivedOrder,
    returnLine,
} from '../fixtures/purchasing'
import { mockEmptyBackend } from '../fixtures/backend'
import { ADMIN, ok, paginated, type MockApi } from '../support/mockApi'

const mockReturn = (api: MockApi) => {
    // Locations and the rest of the menu's lists, empty
    mockEmptyBackend(api)
    api.get(`${ADMIN}/purchase-orders/:id`, () => ok(receivedOrder()))
    api.get(`${ADMIN}/purchase-orders/:id/items`, () => ok([receivedItem()]))
    api.get(`${ADMIN}/purchase-orders/:id/receipts`, () => ok([]))
    api.post(`${ADMIN}/supplier-returns`, () =>
        ok(draftReturn({ subtotal: 0, tax: 0, total: 0, refundDue: 0 }))
    )
    api.get(`${ADMIN}/supplier-returns`, ({ query }) =>
        paginated([draftReturn()], query)
    )
    api.get(`${ADMIN}/supplier-returns/:id`, () => ok(draftReturn()))
    api.get(`${ADMIN}/supplier-returns/:id/items`, () => ok([returnLine()]))
    api.post(`${ADMIN}/supplier-returns/:id/confirm`, () =>
        ok(
            draftReturn({
                status: 'confirmed',
                supplierCreditNoteNumber: '001-001-000000045',
                creditedAmount: 27.6,
                refundDue: 0,
                confirmedAt: '2026-11-12T10:00:00',
                confirmedBy: 'Admin',
            })
        )
    )
}

test.describe('Devoluciones a proveedor', () => {
    test('una orden recibida muestra su IVA por tarifa y abre una devolución', async ({
        page,
        api,
        signIn,
    }) => {
        mockReturn(api)
        await signIn()
        await page.goto('/purchase-orders/1')

        await expect(page.getByText('IVA por tarifa')).toBeVisible()
        await page
            .getByRole('button', { name: 'Devolver al proveedor' })
            .click()

        await expect(page).toHaveURL(/\/supplier-returns\/3$/)
        const [post] = api.callsTo('POST', `${ADMIN}/supplier-returns`)
        expect(post.body).toEqual({ purchaseOrderId: 1 })
        await expect(
            page.getByRole('heading', { name: 'Devolución DP-2026-0001' })
        ).toBeVisible()
    })

    test('confirma la devolución con la nota de crédito del proveedor', async ({
        page,
        api,
        signIn,
    }) => {
        mockReturn(api)
        await signIn()
        await page.goto('/supplier-returns/3')

        await expect(
            page.getByRole('row').filter({ hasText: 'Tornillo 1/2' })
        ).toBeVisible()
        await page.getByRole('button', { name: 'Confirmar' }).click()
        const dialog = page.getByRole('dialog')
        await expect(dialog).toContainText('4 unidades base')
        await dialog
            .getByLabel('N.º de nota de crédito del proveedor (opcional)')
            .fill('001-001-000000045')
        await dialog
            .getByRole('button', { name: 'Confirmar devolución' })
            .click()

        await expect(dialog).toHaveCount(0)
        const [post] = api.callsTo(
            'POST',
            `${ADMIN}/supplier-returns/3/confirm`
        )
        expect(post.body).toEqual({
            supplierCreditNoteNumber: '001-001-000000045',
        })
    })
})
