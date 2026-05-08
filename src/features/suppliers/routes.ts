import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const suppliersRoutes: Routes = [
    {
        key: 'purchases.suppliers',
        path: '/suppliers',
        component: lazy(() => import('./pages/SuppliersListPage')),
        authority: ['supplier:read'],
    },
    {
        key: 'purchases.supplierDetail',
        path: '/suppliers/:id',
        component: lazy(() => import('./pages/SupplierDetailPage')),
        authority: ['supplier:read'],
    },
]
