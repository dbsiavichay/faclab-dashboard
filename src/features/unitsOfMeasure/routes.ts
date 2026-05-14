import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const UnitsOfMeasureListPage = lazy(
    () => import('./pages/UnitsOfMeasureListPage')
)

export const unitsOfMeasureRoutes: Routes = [
    {
        key: 'catalog.unitsOfMeasure',
        path: '/catalog/units-of-measure',
        component: UnitsOfMeasureListPage,
        authority: ['product:read'],
    },
    {
        key: 'inventory.unitsOfMeasure',
        path: '/units-of-measure',
        component: UnitsOfMeasureListPage,
        authority: ['product:read'],
    },
]
