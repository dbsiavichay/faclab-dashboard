import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const warehousesRoutes: Routes = [
    {
        key: 'inventory.warehouses',
        path: '/warehouses',
        component: lazy(() => import('./pages/WarehousesListPage')),
        authority: ['warehouse:write'],
    },
]
