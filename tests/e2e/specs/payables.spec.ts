import { test, expect } from '../support/test'
import { openPayable, supplierAccount } from '../fixtures/purchasing'
import { ADMIN, created, ok, paginated, type MockApi } from '../support/mockApi'
import { ROLE } from '@/constants/roles.constant'

const mockPayables = (api: MockApi) => {
    api.get(`${ADMIN}/payables`, ({ query }) =>
        paginated([openPayable()], query)
    )
    api.get(`${ADMIN}/supplier-accounts/:id`, () => ok(supplierAccount()))
    api.post(`${ADMIN}/supplier-payments`, ({ body }) => {
        const input = body as { amount: number; paymentMethod: string }
        return created({
            id: 1,
            number: 'PP-2026-0001',
            supplierId: 10,
            supplierName: 'Distribuidora Andina',
            amount: input.amount,
            paymentMethod: input.paymentMethod,
            reference: null,
            notes: null,
            paidAt: '2026-11-12T10:00:00',
            paidBy: 'Admin',
            applications: [],
        })
    })
}

test.describe('Cuentas por pagar', () => {
    test('lista lo que se debe y lleva a la cuenta del proveedor', async ({
        page,
        api,
        signIn,
    }) => {
        mockPayables(api)
        await signIn()
        await page.goto('/payables')

        await expect(
            page.getByRole('heading', { name: 'Cuentas por pagar' })
        ).toBeVisible()
        const row = page
            .getByRole('row')
            .filter({ hasText: '001-001-000000123' })
        await expect(row).toContainText('PO-2026-0001')
        await row.getByRole('link', { name: 'Distribuidora Andina' }).click()

        await expect(
            page.getByRole('heading', { name: 'Distribuidora Andina' })
        ).toBeVisible()
        await expect(page.getByText('30 días de plazo')).toBeVisible()
    })

    test('registra un pago a la cuenta que vence primero', async ({
        page,
        api,
        signIn,
    }) => {
        mockPayables(api)
        await signIn()
        await page.goto('/payables/suppliers/10')

        await page.getByRole('button', { name: 'Registrar pago' }).click()
        const dialog = page.getByRole('dialog', {
            name: 'Pago a Distribuidora Andina',
        })
        await dialog.getByLabel('Monto').fill('50')
        await dialog.getByLabel('Referencia').fill('TRF-881')
        await dialog.getByRole('button', { name: 'Guardar' }).click()

        await expect(dialog).toHaveCount(0)
        const [post] = api.callsTo('POST', `${ADMIN}/supplier-payments`)
        expect(post.body).toEqual({
            supplierId: 10,
            amount: 50,
            paymentMethod: 'TRANSFER',
            reference: 'TRF-881',
            notes: null,
        })
    })

    test('no deja pagar más de lo que se le debe', async ({
        page,
        api,
        signIn,
    }) => {
        mockPayables(api)
        await signIn()
        await page.goto('/payables/suppliers/10')

        await page.getByRole('button', { name: 'Registrar pago' }).click()
        const dialog = page.getByRole('dialog', {
            name: 'Pago a Distribuidora Andina',
        })
        await dialog.getByLabel('Monto').fill('69.01')
        await dialog.getByRole('button', { name: 'Guardar' }).click()

        await expect(
            dialog.getByText('Supera lo que se le debe al proveedor')
        ).toBeVisible()
        expect(api.callsTo('POST', `${ADMIN}/supplier-payments`)).toHaveLength(
            0
        )
    })

    test('un operador ve la cuenta pero no registra pagos', async ({
        page,
        api,
        signIn,
    }) => {
        mockPayables(api)
        await signIn({ role: ROLE.OPERATOR })
        await page.goto('/payables/suppliers/10')

        await expect(
            page.getByRole('heading', { name: 'Distribuidora Andina' })
        ).toBeVisible()
        await expect(
            page.getByRole('button', { name: 'Registrar pago' })
        ).toHaveCount(0)
    })
})
