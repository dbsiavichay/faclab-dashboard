import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const categoriesRoutes: Routes = [
    {
        key: 'catalog.categories',
        path: '/catalog/categories',
        component: lazy(() => import('./pages/CategoriesListPage')),
        authority: ['product:read'],
    },
]
