import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const movementsRoutes: Routes = [
    {
        key: 'inventory.movements',
        path: '/movements',
        component: lazy(() => import('./pages/MovementsListPage')),
        authority: ['movement:write'],
    },
]
