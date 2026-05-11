import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const locationsRoutes: Routes = [
    {
        key: 'inventory.locations',
        path: '/locations',
        component: lazy(() => import('./pages/LocationsListPage')),
        authority: ['location:write'],
    },
]
