import { test, expect } from '../support/test'
import { aging, builderAccount } from '../fixtures/receivables'
import { ADMIN, created, ok, type MockApi } from '../support/mockApi'
import { ROLE } from '@/constants/roles.constant'
import type { Statement } from '@/features/receivables/model/types'

const statement = (): Statement => ({
    customerId: 70,
    customerName: 'Ferretería El Maestro',
    customerTaxId: '1790012345001',
    fromDate: null,
    toDate: null,
    openingBalance: 0,
    lines: [
        {
            type: 'SALE',
            id: 31,
            date: '2026-10-02T10:00:00',
            documentNumber: 'V-001-000501',
            charge: 120,
            credit: 0,
            balance: 120,
            receivableId: 31,
            saleId: 501,
            customerPaymentId: null,
            refundId: null,
            dueOn: '2026-11-01',
            paymentMethod: null,
        },
    ],
    closingBalance: 120,
})

const mockReceivables = (api: MockApi) => {
    api.get(`${ADMIN}/receivables/aging`, () => ok(aging()))
    api.get(`${ADMIN}/customer-accounts/:id`, () => ok(builderAccount()))
    api.get(`${ADMIN}/customer-accounts/:id/statement`, () => ok(statement()))
    api.post(`${ADMIN}/customer-payments`, ({ body }) => {
        const input = body as { amount: number; paymentMethod: string }
        return created({
            id: 1,
            number: 'AB-2026-0001',
            customerId: 70,
            customerName: 'Ferretería El Maestro',
            amount: input.amount,
            paymentMethod: input.paymentMethod,
            reference: null,
            notes: null,
            paidAt: '2026-11-11T10:00:00',
            receivedBy: 'Admin',
            branchId: 1,
            terminalId: null,
            shiftId: null,
            applications: [],
        })
    })
}

test.describe('Cartera', () => {
    test('muestra la antigüedad y filtra los clientes por tramo', async ({
        page,
        api,
        signIn,
    }) => {
        mockReceivables(api)
        await signIn()
        await page.goto('/receivables')

        await expect(
            page.getByRole('heading', { name: 'Cartera' })
        ).toBeVisible()
        const maestro = page
            .getByRole('row')
            .filter({ hasText: 'Ferretería El Maestro' })
        const andina = page
            .getByRole('row')
            .filter({ hasText: 'Constructora Andina' })
        await expect(maestro).toBeVisible()
        await expect(andina).toBeVisible()

        // Solo quien tiene saldo por vencer
        await page.getByRole('button', { name: /Por vencer/ }).click()
        await expect(andina).toBeVisible()
        await expect(maestro).toHaveCount(0)

        await page.getByRole('button', { name: /Total por cobrar/ }).click()
        await page
            .getByRole('button', {
                name: 'Ver la cuenta de Ferretería El Maestro',
            })
            .click()

        await expect(
            page.getByRole('heading', { name: 'Ferretería El Maestro' })
        ).toBeVisible()
        await expect(page.getByText('10 días vencida')).toBeVisible()
        await expect(
            page.getByRole('row').filter({ hasText: 'Venta a crédito' })
        ).toContainText('V-001-000501')
    })

    test('registra un abono fuera de caja a la cuenta que vence primero', async ({
        page,
        api,
        signIn,
    }) => {
        mockReceivables(api)
        await signIn()
        await page.goto('/receivables/customers/70')

        await page.getByRole('button', { name: 'Registrar abono' }).click()
        const dialog = page.getByRole('dialog', {
            name: 'Abono de Ferretería El Maestro',
        })
        await dialog.getByLabel('Monto').fill('50')
        await dialog.getByLabel('Referencia').fill('TRF-001')
        await dialog.getByRole('button', { name: 'Guardar' }).click()

        await expect(dialog).toHaveCount(0)
        const [post] = api.callsTo('POST', `${ADMIN}/customer-payments`)
        // Sin aplicación manual: faclab-core paga la que vence primero
        expect(post.body).toEqual({
            customerId: 70,
            amount: 50,
            paymentMethod: 'CASH',
            reference: 'TRF-001',
            notes: null,
        })
    })

    test('no deja abonar más de lo que debe el cliente', async ({
        page,
        api,
        signIn,
    }) => {
        mockReceivables(api)
        await signIn()
        await page.goto('/receivables/customers/70')

        await page.getByRole('button', { name: 'Registrar abono' }).click()
        const dialog = page.getByRole('dialog', {
            name: 'Abono de Ferretería El Maestro',
        })
        await dialog.getByLabel('Monto').fill('120.01')
        await dialog.getByRole('button', { name: 'Guardar' }).click()

        await expect(
            dialog.getByText('Supera lo que debe el cliente')
        ).toBeVisible()
        expect(api.callsTo('POST', `${ADMIN}/customer-payments`)).toHaveLength(
            0
        )
    })

    test('quien solo lee la cartera no registra abonos', async ({
        page,
        api,
        signIn,
    }) => {
        mockReceivables(api)
        await signIn({ role: ROLE.VIEWER })
        await page.goto('/receivables/customers/70')

        await expect(
            page.getByRole('heading', { name: 'Ferretería El Maestro' })
        ).toBeVisible()
        await expect(
            page.getByRole('button', { name: 'Registrar abono' })
        ).toHaveCount(0)
    })
})
