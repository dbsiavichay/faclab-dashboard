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
import { unitsOfMeasureRoutes } from '@features/unitsOfMeasure'
import { productsRoutes } from '@features/products'
import { stockRoutes } from '@features/stock'
import { lotsRoutes } from '@features/lots'
import { serialNumbersRoutes } from '@features/serialNumbers'
import { movementsRoutes } from '@features/movements'
import { alertsRoutes } from '@features/alerts'
import { adjustmentsRoutes } from '@features/adjustments'
import { transfersRoutes } from '@features/transfers'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    ...productsRoutes,
    ...unitsOfMeasureRoutes,
    ...stockRoutes,
    ...movementsRoutes,
    ...warehousesRoutes,
    ...locationsRoutes,
    ...customersRoutes,
    ...lotsRoutes,
    ...serialNumbersRoutes,
    ...adjustmentsRoutes,
    ...transfersRoutes,
    ...purchasesRoutes,
    ...salesRoutes,
    ...reportsRoutes,
    ...alertsRoutes,
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
