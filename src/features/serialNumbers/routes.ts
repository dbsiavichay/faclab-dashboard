import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const serialNumbersRoutes: Routes = [
    {
        key: 'inventory.serials',
        path: '/serials',
        component: lazy(() => import('./pages/SerialNumbersListPage')),
        authority: ['serial:write'],
    },
]
