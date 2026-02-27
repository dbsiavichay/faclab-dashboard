import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'inventory.product',
        path: '/products',
        component: lazy(() => import('@/views/inventory/ProductsView')),
        authority: [],
    },
    {
        key: 'inventory.category',
        path: '/categories',
        component: lazy(() => import('@/views/inventory/CategoriesView')),
        authority: [],
    },
    {
        key: 'inventory.stock',
        path: '/stock',
        component: lazy(() => import('@/views/inventory/StockView')),
        authority: [],
    },
    {
        key: 'inventory.movements',
        path: '/movements',
        component: lazy(() => import('@/views/inventory/MovementsView')),
        authority: [],
    },
    {
        key: 'inventory.unitsOfMeasure',
        path: '/units-of-measure',
        component: lazy(() => import('@/views/inventory/UnitsOfMeasureView')),
        authority: [],
    },
    {
        key: 'inventory.warehouses',
        path: '/warehouses',
        component: lazy(() => import('@/views/inventory/WarehousesView')),
        authority: [],
    },
    {
        key: 'inventory.locations',
        path: '/locations',
        component: lazy(() => import('@/views/inventory/LocationsView')),
        authority: [],
    },
    {
        key: 'sales.customers',
        path: '/customers',
        component: lazy(() => import('@/views/inventory/CustomersView')),
        authority: [],
    },
    {
        key: 'sales.customerDetail',
        path: '/customers/:id',
        component: lazy(() => import('@/views/inventory/CustomerDetailView')),
        authority: [],
    },
    {
        key: 'groupMenu.collapse.item1',
        path: '/group-collapse-menu-item-view-1',
        component: lazy(
            () => import('@/views/demo/GroupCollapseMenuItemView1')
        ),
        authority: [],
    },
    {
        key: 'groupMenu.collapse.item2',
        path: '/group-collapse-menu-item-view-2',
        component: lazy(
            () => import('@/views/demo/GroupCollapseMenuItemView2')
        ),
        authority: [],
    },
]
