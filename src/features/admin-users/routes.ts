import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const adminUsersRoutes: Routes = [
    {
        key: 'settings.users',
        path: '/settings/users',
        component: lazy(() => import('./pages/UsersPage')),
        authority: ['user:manage'],
    },
]
