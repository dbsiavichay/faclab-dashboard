import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const alertsRoutes: Routes = [
    {
        key: 'inventory.alerts',
        path: '/alerts',
        component: lazy(() => import('./pages/AlertsPage')),
        authority: ['alert:read'],
    },
]
