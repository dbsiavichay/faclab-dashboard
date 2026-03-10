import type { Routes } from '@/@types/routes'
import authRoute from './authRoute'
import { lazy } from 'react'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'catalog.categories',
        path: '/catalog/categories',
        component: lazy(() => import('@/views/inventory/CategoriesView')),
        authority: [],
    },
    {
        key: 'catalog.products',
        path: '/catalog/products',
        component: lazy(() => import('@/views/inventory/ProductsView')),
        authority: [],
    },
    {
        key: 'catalog.unitsOfMeasure',
        path: '/catalog/units-of-measure',
        component: lazy(() => import('@/views/inventory/UnitsOfMeasureView')),
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
        key: 'purchases.suppliers',
        path: '/suppliers',
        component: lazy(() => import('@/views/inventory/SuppliersView')),
        authority: [],
    },
    {
        key: 'purchases.supplierDetail',
        path: '/suppliers/:id',
        component: lazy(() => import('@/views/inventory/SupplierDetailView')),
        authority: [],
    },
    {
        key: 'inventory.lots',
        path: '/lots',
        component: lazy(() => import('@/views/inventory/LotsView')),
        authority: [],
    },
    {
        key: 'inventory.serials',
        path: '/serials',
        component: lazy(() => import('@/views/inventory/SerialNumbersView')),
        authority: [],
    },
    {
        key: 'inventory.adjustments',
        path: '/adjustments',
        component: lazy(() => import('@/views/inventory/AdjustmentsView')),
        authority: [],
    },
    {
        key: 'inventory.adjustmentDetail',
        path: '/adjustments/:id',
        component: lazy(() => import('@/views/inventory/AdjustmentDetailView')),
        authority: [],
    },
    {
        key: 'inventory.transfers',
        path: '/transfers',
        component: lazy(() => import('@/views/inventory/TransfersView')),
        authority: [],
    },
    {
        key: 'inventory.transferDetail',
        path: '/transfers/:id',
        component: lazy(() => import('@/views/inventory/TransferDetailView')),
        authority: [],
    },
    {
        key: 'purchases.purchaseOrders',
        path: '/purchase-orders',
        component: lazy(() => import('@/views/purchases/PurchaseOrdersView')),
        authority: [],
    },
    {
        key: 'purchases.purchaseOrderDetail',
        path: '/purchase-orders/:id',
        component: lazy(
            () => import('@/views/purchases/PurchaseOrderDetailView')
        ),
        authority: [],
    },
    {
        key: 'sales.sales',
        path: '/sales',
        component: lazy(() => import('@/views/sales/SalesView')),
        authority: [],
    },
    {
        key: 'sales.saleDetail',
        path: '/sales/:id',
        component: lazy(() => import('@/views/sales/SaleDetailView')),
        authority: [],
    },
    {
        key: 'reports.inventory',
        path: '/reports/inventory',
        component: lazy(() => import('@/views/reports/ReportsView')),
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
