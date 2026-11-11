import { test, expect } from '../support/test'
import {
    ANDES,
    IN_TWO_WEEKS,
    buildQuote,
    mockPosQuotes,
    mockQuotes,
    posQuote,
    posQuoteItem,
} from '../fixtures/quotes'
import {
    WHOLESALE_PRICES,
    builder,
    mockPOS,
    openShift,
    posTerminal,
} from '../fixtures/pos'
import { ADMIN, POS } from '../support/mockApi'
import { ROLE } from '@/constants/roles.constant'

test.describe('Cotizaciones', () => {
    test('crea una cotización, le agrega un ítem y descarga su PDF', async ({
        page,
        api,
        signIn,
    }) => {
        mockQuotes(api)
        await signIn()
        await page.goto('/quotes')

        await page.getByRole('button', { name: 'Nueva cotización' }).click()
        const form = page.getByRole('dialog', { name: 'Nueva cotización' })
        // Quince días de validez por defecto, en la sucursal activa
        await expect(form.getByLabel('Válida hasta')).toHaveValue(IN_TWO_WEEKS)
        await expect(form.getByLabel('Sucursal')).toHaveValue('001 Matriz')
        await form.getByLabel('Notas').fill('Obra Calderón')
        await form.getByRole('button', { name: 'Guardar' }).click()

        await expect(
            page.getByRole('heading', { name: 'Cotización COT-001-000001' })
        ).toBeVisible()
        const [post] = api.callsTo('POST', `${ADMIN}/quotes`)
        expect(post.body).toEqual({
            branchId: 1,
            customerId: null,
            validUntil: IN_TWO_WEEKS,
            notes: 'Obra Calderón',
        })

        await page.getByRole('button', { name: 'Agregar ítem' }).click()
        const itemForm = page.getByRole('dialog', { name: 'Agregar ítem' })
        await itemForm.getByLabel('Producto').fill('Tablero')
        await page.getByRole('option', { name: /Tablero MDF 15mm/ }).click()
        await itemForm.getByLabel('Cantidad').fill('3')
        await itemForm.getByRole('button', { name: 'Guardar' }).click()

        await expect(
            page.getByRole('row').filter({ hasText: 'Tablero MDF 15mm' })
        ).toBeVisible()
        const [item] = api.callsTo('POST', `${ADMIN}/quotes/1/items`)
        expect(item.body).toEqual({
            productId: 1,
            presentationId: null,
            quantity: 3,
            discount: 0,
        })

        const [pdf] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: 'PDF' }).click(),
        ])
        expect(pdf.suggestedFilename()).toBe('cotizacion-COT-001-000001.pdf')
    })

    test('envía una cotización por correo al cliente', async ({
        page,
        api,
        signIn,
    }) => {
        mockQuotes(api, [
            buildQuote({
                customerId: ANDES.id,
                customerName: ANDES.name,
                customerEmail: ANDES.email ?? null,
                items: [posQuoteItem({ quoteId: 1 })],
            }),
        ])
        await signIn()
        await page.goto('/quotes/1')

        await page.getByRole('button', { name: 'Enviar por correo' }).click()
        const dialog = page.getByRole('dialog', {
            name: 'Enviar COT-001-000001 por correo',
        })
        await expect(dialog.getByLabel('Correo')).toHaveValue(
            'compras@andes.ec'
        )
        await dialog.getByRole('button', { name: 'Guardar' }).click()

        await expect(page.getByText('Enviada', { exact: true })).toBeVisible()
        const [email] = api.callsTo('POST', `${ADMIN}/quotes/1/email`)
        expect(email.body).toEqual({ to: 'compras@andes.ec' })
    })

    test('una cotización vencida solo se renueva', async ({
        page,
        api,
        signIn,
    }) => {
        mockQuotes(api, [
            buildQuote({
                status: 'SENT',
                issueDate: '2026-01-01',
                validUntil: '2026-01-15',
                items: [posQuoteItem({ quoteId: 1 })],
            }),
        ])
        await signIn()
        await page.goto('/quotes/1')

        await expect(page.getByText('Vencida', { exact: true })).toBeVisible()
        await expect(
            page.getByRole('button', { name: 'Cobrar en el POS' })
        ).toHaveCount(0)
        await expect(
            page.getByRole('button', { name: 'Enviar por correo' })
        ).toHaveCount(0)

        await page.getByRole('button', { name: 'Renovar' }).click()
        const dialog = page.getByRole('dialog', {
            name: 'Renovar COT-001-000001',
        })
        await dialog.getByRole('button', { name: 'Guardar' }).click()

        await expect(page.getByText('Borrador', { exact: true })).toBeVisible()
        const [renew] = api.callsTo('POST', `${ADMIN}/quotes/1/renew`)
        expect(renew.body).toEqual({ validUntil: IN_TWO_WEEKS })
    })

    test('quien solo lee las ventas no cotiza', async ({
        page,
        api,
        signIn,
    }) => {
        mockQuotes(api, [buildQuote({ items: [posQuoteItem({ quoteId: 1 })] })])
        await signIn({ role: ROLE.VIEWER })
        await page.goto('/quotes')

        await expect(
            page.getByRole('row').filter({ hasText: 'COT-001-000001' })
        ).toBeVisible()
        await expect(
            page.getByRole('button', { name: 'Nueva cotización' })
        ).toHaveCount(0)
    })
})

test.describe('Cobrar una cotización en el POS', () => {
    test('respeta el precio cotizado aunque la lista cambió', async ({
        page,
        api,
        signIn,
    }) => {
        await signIn({ role: ROLE.CASHIER, username: 'caja1' })
        // Cotizado a 10.00; hoy la lista del maestro dice 11.00
        mockPOS(api, openShift(), [posTerminal()], WHOLESALE_PRICES)
        mockPosQuotes(
            api,
            posQuote({
                items: [
                    posQuoteItem({
                        listPrice: 11,
                        priceListName: 'Mayorista',
                        priceChanged: true,
                    }),
                ],
            })
        )
        await page.goto('/pos')

        await page.getByRole('button', { name: 'Cotizaciones' }).click()
        await page
            .getByRole('button', { name: 'Cargar cotización COT-001-000007' })
            .click()
        const prices = page.getByRole('dialog', { name: 'Precios cambiados' })
        await expect(prices.getByText('Tablero MDF 15mm')).toBeVisible()
        await prices
            .getByRole('button', { name: 'Respetar precio cotizado' })
            .click()

        const panel = page.getByRole('complementary', { name: 'Orden' })
        await expect(panel.getByText('Cotización COT-001-000007')).toBeVisible()
        // Its lines don't change while the quote is loaded
        await expect(
            panel.getByRole('button', { name: 'Quitar Tablero MDF 15mm' })
        ).toBeDisabled()

        const pay = panel.getByRole('button', { name: 'Cobrar' })
        await expect(pay).toBeEnabled()
        await pay.click()
        await page
            .getByRole('dialog', { name: 'Cobrar' })
            .getByRole('button', { name: 'Completar venta' })
            .click()
        await expect(
            page.getByRole('dialog', { name: 'Venta completada' })
        ).toBeVisible()

        const [quickSale] = api.callsTo('POST', `${POS}/sales/quick`)
        const sale = quickSale.body as {
            quoteId: number
            customerId: number
            items: unknown[]
        }
        expect(sale.quoteId).toBe(7)
        expect(sale.customerId).toBe(builder().id)
        expect(sale.items).toEqual([
            {
                productId: 1,
                quantity: 2,
                unitPrice: 10,
                overrideReason: 'Cotización COT-001-000007',
            },
        ])
    })

    test('no carga una cotización vencida', async ({ page, api, signIn }) => {
        await signIn({ role: ROLE.CASHIER, username: 'caja1' })
        mockPOS(api)
        mockPosQuotes(api, posQuote({ expired: true }))
        await page.goto('/pos')

        await page.getByRole('button', { name: 'Cotizaciones' }).click()
        await page
            .getByRole('button', { name: 'Cargar cotización COT-001-000007' })
            .click()

        await expect(
            page.getByText('La cotización COT-001-000007 venció')
        ).toBeVisible()
        await expect(
            page
                .getByRole('complementary', { name: 'Orden' })
                .getByText('Carrito vacío')
        ).toBeVisible()
    })
})
