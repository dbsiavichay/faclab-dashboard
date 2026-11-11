import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const priceListsRoutes: Routes = [
    {
        key: 'catalog.priceLists',
        path: '/catalog/price-lists',
        component: lazy(() => import('./pages/PriceListsPage')),
        authority: ['product:read'],
    },
    {
        key: 'catalog.priceListDetail',
        path: '/catalog/price-lists/:id',
        component: lazy(() => import('./pages/PriceListDetailPage')),
        authority: ['product:read'],
    },
]
