import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const payablesRoutes: Routes = [
    {
        key: 'purchases.payables',
        path: '/payables',
        component: lazy(() => import('./pages/PayablesPage')),
        authority: ['payable:read'],
    },
    {
        key: 'purchases.supplierAccount',
        path: '/payables/suppliers/:id',
        component: lazy(() => import('./pages/SupplierAccountPage')),
        authority: ['payable:read'],
    },
]
