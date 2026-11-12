import { test, expect } from '../support/test'
import { mockEmptyBackend } from '../fixtures/backend'
import { mockCatalog } from '../fixtures/catalog'
import { ADMIN, ok, paginated, type MockApi } from '../support/mockApi'
import type { Kardex } from '@/features/reports/model/types'

// Two purchases (10 at 5.00 and 30 at 7.00, average 6.50) and a sale of 15
const kardex = (): Kardex => ({
    productId: 1,
    productName: 'Tablero MDF 15mm',
    sku: 'MDF-15',
    warehouseId: 1,
    fromDate: '2026-04-01',
    toDate: '2026-04-30',
    opening: { quantity: 0, value: 0, averageCost: null },
    entries: [
        {
            movementId: 1,
            date: '2026-04-01T10:00:00',
            type: 'IN',
            locationId: 1,
            locationName: 'Percha A1',
            referenceType: 'purchase_order',
            referenceId: 7,
            reason: null,
            inQuantity: 10,
            outQuantity: 0,
            unitCost: 5,
            value: 50,
            balanceQuantity: 10,
            balanceValue: 50,
            averageCost: 5,
        },
        {
            movementId: 2,
            date: '2026-04-02T10:00:00',
            type: 'IN',
            locationId: 1,
            locationName: 'Percha A1',
            referenceType: 'purchase_order',
            referenceId: 8,
            reason: null,
            inQuantity: 30,
            outQuantity: 0,
            unitCost: 7,
            value: 210,
            balanceQuantity: 40,
            balanceValue: 260,
            averageCost: 6.5,
        },
        {
            movementId: 3,
            date: '2026-04-03T10:00:00',
            type: 'OUT',
            locationId: 1,
            locationName: 'Percha A1',
            referenceType: 'sale',
            referenceId: 12,
            reason: null,
            inQuantity: 0,
            outQuantity: 15,
            unitCost: 6.5,
            value: 97.5,
            balanceQuantity: 25,
            balanceValue: 162.5,
            averageCost: 6.5,
        },
    ],
    totalIn: { quantity: 40, value: 260 },
    totalOut: { quantity: 15, value: 97.5 },
    closing: { quantity: 25, value: 162.5, averageCost: 6.5 },
})

const mockKardex = (api: MockApi) => {
    mockEmptyBackend(api)
    mockCatalog(api)
    api.get(`${ADMIN}/warehouses`, ({ query }) =>
        paginated(
            [
                {
                    id: 1,
                    branchId: 1,
                    name: 'Bodega Matriz',
                    code: 'BOD-001',
                    isActive: true,
                },
            ],
            query
        )
    )
    api.get(`${ADMIN}/reports/inventory/kardex`, () => ok(kardex()))
}

test.describe('Kárdex', () => {
    test('muestra los saldos y cada movimiento a su costo', async ({
        page,
        api,
        signIn,
    }) => {
        mockKardex(api)
        await signIn()
        await page.goto('/reports/inventory')

        await page.getByRole('tab', { name: 'Kárdex' }).click()
        await expect(page.getByText('Elige un producto')).toBeVisible()
        expect(
            api.callsTo('GET', `${ADMIN}/reports/inventory/kardex`)
        ).toHaveLength(0)

        await page.getByLabel('Producto').fill('Tablero')
        await page.getByRole('option', { name: /Tablero MDF 15mm/ }).click()

        await expect(page.getByText('Saldo final')).toBeVisible()
        await expect(page.getByText('25 u. a $6,50')).toBeVisible()
        const rows = page.getByRole('row')
        await expect(rows.filter({ hasText: 'Venta #12' })).toContainText(
            '$97,50'
        )
        await expect(
            rows.filter({ hasText: 'Orden de compra #8' })
        ).toContainText('$260,00')

        const [call] = api.callsTo('GET', `${ADMIN}/reports/inventory/kardex`)
        expect(call.query.get('productId')).toBe('1')
        expect(call.query.get('fromDate')).toMatch(/^\d{4}-\d{2}-01$/)
    })
})
