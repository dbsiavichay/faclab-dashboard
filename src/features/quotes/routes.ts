import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const quotesRoutes: Routes = [
    {
        key: 'sales.quotes',
        path: '/quotes',
        component: lazy(() => import('./pages/QuotesListPage')),
        authority: ['sale:read'],
    },
    {
        key: 'sales.quoteDetail',
        path: '/quotes/:id',
        component: lazy(() => import('./pages/QuoteDetailPage')),
        authority: ['sale:read'],
    },
]
