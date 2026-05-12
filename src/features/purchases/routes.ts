import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const purchasesRoutes: Routes = [
    {
        key: 'purchases.purchaseOrders',
        path: '/purchase-orders',
        component: lazy(() => import('./pages/PurchaseOrdersListPage')),
        authority: ['purchase:read'],
    },
    {
        key: 'purchases.purchaseOrderDetail',
        path: '/purchase-orders/:id',
        component: lazy(() => import('./pages/PurchaseOrderDetailPage')),
        authority: ['purchase:read'],
    },
]
