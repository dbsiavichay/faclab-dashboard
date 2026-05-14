import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const lotsRoutes: Routes = [
    {
        key: 'inventory.lots',
        path: '/lots',
        component: lazy(() => import('./pages/LotsListPage')),
        authority: ['lot:write'],
    },
]
