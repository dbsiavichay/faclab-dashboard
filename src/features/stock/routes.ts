import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const stockRoutes: Routes = [
    {
        key: 'inventory.stock',
        path: '/stock',
        component: lazy(() => import('./pages/StockPage')),
        authority: ['stock:read'],
    },
]
