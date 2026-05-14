import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const transfersRoutes: Routes = [
    {
        key: 'inventory.transfers',
        path: '/transfers',
        component: lazy(() => import('./pages/TransfersListPage')),
        authority: ['transfer:write'],
    },
    {
        key: 'inventory.transferDetail',
        path: '/transfers/:id',
        component: lazy(() => import('./pages/TransferDetailPage')),
        authority: ['transfer:write'],
    },
]
