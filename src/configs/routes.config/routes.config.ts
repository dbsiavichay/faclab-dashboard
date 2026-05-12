import type { Routes } from '@/@types/routes'
import authRoute from './authRoute'
import { lazy } from 'react'
import { warehousesRoutes } from '@features/warehouses'
import { locationsRoutes } from '@features/locations'
import { customersRoutes } from '@features/customers'
import { reportsRoutes } from '@features/reports'
import { salesRoutes } from '@features/sales'
import { purchasesRoutes } from '@features/purchases'
import { posRoutes } from '@features/pos'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'catalog.products',
        path: '/catalog/products',
        component: lazy(() => import('@/views/inventory/ProductsView')),
        authority: ['product:read'],
    },
    {
        key: 'catalog.unitsOfMeasure',
        path: '/catalog/units-of-measure',
        component: lazy(() => import('@/views/inventory/UnitsOfMeasureView')),
        authority: ['product:read'],
    },
    {
        key: 'inventory.stock',
        path: '/stock',
        component: lazy(() => import('@/views/inventory/StockView')),
        authority: ['stock:read'],
    },
    {
        key: 'inventory.movements',
        path: '/movements',
        component: lazy(() => import('@/views/inventory/MovementsView')),
        authority: ['movement:write'],
    },
    {
        key: 'inventory.unitsOfMeasure',
        path: '/units-of-measure',
        component: lazy(() => import('@/views/inventory/UnitsOfMeasureView')),
        authority: ['product:read'],
    },
    ...warehousesRoutes,
    ...locationsRoutes,
    ...customersRoutes,
    {
        key: 'inventory.lots',
        path: '/lots',
        component: lazy(() => import('@/views/inventory/LotsView')),
        authority: ['lot:write'],
    },
    {
        key: 'inventory.serials',
        path: '/serials',
        component: lazy(() => import('@/views/inventory/SerialNumbersView')),
        authority: ['serial:write'],
    },
    {
        key: 'inventory.adjustments',
        path: '/adjustments',
        component: lazy(() => import('@/views/inventory/AdjustmentsView')),
        authority: ['adjustment:write'],
    },
    {
        key: 'inventory.adjustmentDetail',
        path: '/adjustments/:id',
        component: lazy(() => import('@/views/inventory/AdjustmentDetailView')),
        authority: ['adjustment:write'],
    },
    {
        key: 'inventory.transfers',
        path: '/transfers',
        component: lazy(() => import('@/views/inventory/TransfersView')),
        authority: ['transfer:write'],
    },
    {
        key: 'inventory.transferDetail',
        path: '/transfers/:id',
        component: lazy(() => import('@/views/inventory/TransferDetailView')),
        authority: ['transfer:write'],
    },
    ...purchasesRoutes,
    ...salesRoutes,
    ...reportsRoutes,
    {
        key: 'inventory.alerts',
        path: '/alerts',
        component: lazy(() => import('@/views/inventory/AlertsView')),
        authority: ['alert:read'],
    },
    ...posRoutes,
    {
        key: 'settings.users',
        path: '/settings/users',
        component: lazy(() => import('@/views/settings/UsersView')),
        authority: ['user:manage'],
    },
    {
        key: 'settings.companyConfig',
        path: '/settings/company-config',
        component: lazy(() => import('@/views/settings/CompanyConfigView')),
        authority: [],
    },
    {
        key: 'settings.certificates',
        path: '/settings/certificates',
        component: lazy(() => import('@/views/settings/CertificatesView')),
        authority: [],
    },
    {
        key: 'changePassword',
        path: '/change-password',
        component: lazy(() => import('@/views/auth/ChangePassword')),
        authority: [],
    },
    {
        key: 'accessDenied',
        path: '/access-denied',
        component: lazy(() => import('@/views/auth/AccessDenied')),
        authority: [],
    },
]
