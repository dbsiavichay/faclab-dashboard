import { suppliersRoutes } from '@features/suppliers'
import { categoriesRoutes } from '@features/categories'
import { warehousesRoutes } from '@features/warehouses'
import { locationsRoutes } from '@features/locations'
import {
    protectedRoutes as legacyProtectedRoutes,
    publicRoutes,
} from '@/configs/routes.config'
import type { Routes } from '@/@types/routes'

const featureRoutes: Routes = [
    ...suppliersRoutes,
    ...categoriesRoutes,
    ...warehousesRoutes,
    ...locationsRoutes,
]
const featureKeys = new Set(featureRoutes.map((r) => r.key))

const protectedRoutes: Routes = [
    ...featureRoutes,
    ...legacyProtectedRoutes.filter((r) => !featureKeys.has(r.key)),
]

export { protectedRoutes, publicRoutes }
