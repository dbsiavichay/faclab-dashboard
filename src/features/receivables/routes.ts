import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const receivablesRoutes: Routes = [
    {
        key: 'sales.receivables',
        path: '/receivables',
        component: lazy(() => import('./pages/ReceivablesPage')),
        authority: ['receivable:read'],
    },
    {
        key: 'sales.customerAccount',
        path: '/receivables/customers/:id',
        component: lazy(() => import('./pages/CustomerAccountPage')),
        authority: ['receivable:read'],
    },
]
