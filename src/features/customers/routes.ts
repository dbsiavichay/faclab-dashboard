import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const customersRoutes: Routes = [
    {
        key: 'sales.customers',
        path: '/customers',
        component: lazy(() => import('./pages/CustomersListPage')),
        authority: ['customer:read'],
    },
    {
        key: 'sales.customerDetail',
        path: '/customers/:id',
        component: lazy(() => import('./pages/CustomerDetailPage')),
        authority: ['customer:read'],
    },
]
