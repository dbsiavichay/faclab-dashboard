import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const adjustmentsRoutes: Routes = [
    {
        key: 'inventory.adjustments',
        path: '/adjustments',
        component: lazy(() => import('./pages/AdjustmentsListPage')),
        authority: ['adjustment:write'],
    },
    {
        key: 'inventory.adjustmentDetail',
        path: '/adjustments/:id',
        component: lazy(() => import('./pages/AdjustmentDetailPage')),
        authority: ['adjustment:write'],
    },
]
