import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const productsRoutes: Routes = [
    {
        key: 'catalog.products',
        path: '/catalog/products',
        component: lazy(() => import('./pages/ProductsListPage')),
        authority: ['product:read'],
    },
]
