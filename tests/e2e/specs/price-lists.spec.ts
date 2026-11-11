import { test, expect } from '../support/test'
import { mockPriceLists } from '../fixtures/priceLists'
import { ADMIN } from '../support/mockApi'
import { ROLE } from '@/constants/roles.constant'
import type { Page } from '@playwright/test'

const row = (page: Page, name: string) =>
    page.getByRole('row').filter({ hasText: name })

test.describe('Listas de precios', () => {
    test.beforeEach(({ api }) => {
        mockPriceLists(api)
    })

    test('lista la general y crea una lista con vigencia', async ({
        page,
        api,
        signIn,
    }) => {
        await signIn()
        await page.goto('/catalog/price-lists')

        await expect(row(page, 'General')).toContainText('Siempre')
        await expect(
            row(page, 'General').getByRole('button', { name: /Eliminar/ })
        ).toHaveCount(0)

        await page.getByRole('button', { name: 'Nueva lista' }).click()
        const dialog = page.getByRole('dialog', { name: 'Nueva lista' })
        await dialog.getByLabel('Nombre').fill('Navidad')
        await dialog.getByLabel('Rige desde').fill('2026-12-01')
        await dialog.getByLabel('Rige hasta').fill('2026-11-01')
        await dialog.getByRole('button', { name: 'Guardar' }).click()
        await expect(dialog.getByText('Termina antes de empezar')).toBeVisible()
        expect(api.callsTo('POST', `${ADMIN}/price-lists`)).toHaveLength(0)

        await dialog.getByLabel('Rige hasta').fill('2026-12-31')
        await dialog.getByRole('button', { name: 'Guardar' }).click()

        await expect(row(page, 'Navidad')).toBeVisible()
        const [post] = api.callsTo('POST', `${ADMIN}/price-lists`)
        expect(post.body).toEqual({
            name: 'Navidad',
            description: null,
            isActive: true,
            validFrom: '2026-12-01',
            validTo: '2026-12-31',
        })
    })

    test('agrega el precio mayorista de un producto', async ({
        page,
        api,
        signIn,
    }) => {
        await signIn()
        await page.goto('/catalog/price-lists/2')
        await expect(
            page.getByRole('heading', { name: 'Mayorista' })
        ).toBeVisible()

        await page.getByRole('button', { name: 'Agregar precio' }).click()
        const dialog = page.getByRole('dialog', { name: 'Agregar precio' })
        await dialog.getByLabel('Producto').fill('Tablero')
        await page.getByRole('option', { name: /Tablero MDF 15mm/ }).click()
        await dialog.getByLabel('Precio', { exact: true }).fill('11')
        await dialog.getByRole('button', { name: 'Guardar' }).click()

        await expect(row(page, 'Tablero MDF 15mm')).toContainText(
            'Cualquier cantidad'
        )
        const [post] = api.callsTo('POST', `${ADMIN}/price-lists/2/items`)
        expect(post.body).toEqual({ productId: 1, price: 11, minQuantity: 0 })
    })

    test('quien solo lee el catálogo no cambia precios', async ({
        page,
        signIn,
    }) => {
        await signIn({ role: ROLE.VIEWER })
        await page.goto('/catalog/price-lists')

        await expect(row(page, 'Mayorista')).toBeVisible()
        await expect(
            page.getByRole('button', { name: 'Nueva lista' })
        ).toHaveCount(0)
    })
})
