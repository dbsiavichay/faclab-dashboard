import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const reportsRoutes: Routes = [
    {
        key: 'reports.inventory',
        path: '/reports/inventory',
        component: lazy(() => import('./pages/ReportsPage')),
        authority: ['report:inventory:read'],
    },
]
