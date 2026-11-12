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
    // Supplier returns (S5.7)
    {
        key: 'purchases.supplierReturns',
        path: '/supplier-returns',
        component: lazy(() => import('./pages/SupplierReturnsListPage')),
        authority: ['purchase:read'],
    },
    {
        key: 'purchases.supplierReturnDetail',
        path: '/supplier-returns/:id',
        component: lazy(() => import('./pages/SupplierReturnDetailPage')),
        authority: ['purchase:read'],
    },
]
