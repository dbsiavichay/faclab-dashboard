import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const posRoutes: Routes = [
    {
        key: 'pos',
        path: '/pos',
        component: lazy(() => import('./pages/POSPage')),
        authority: ['pos:operate'],
    },
]
