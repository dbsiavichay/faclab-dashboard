import { suppliersRoutes } from '@features/suppliers'
import {
    protectedRoutes as legacyProtectedRoutes,
    publicRoutes,
} from '@/configs/routes.config'
import type { Routes } from '@/@types/routes'

const supplierKeys = new Set(suppliersRoutes.map((r) => r.key))

const protectedRoutes: Routes = [
    ...suppliersRoutes,
    ...legacyProtectedRoutes.filter((r) => !supplierKeys.has(r.key)),
]

export { protectedRoutes, publicRoutes }
