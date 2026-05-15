import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const authRoute: Routes = [
    {
        key: 'signIn',
        path: `/sign-in`,
        component: lazy(() => import('@features/auth/pages/SignInPage')),
        authority: [],
    },
]

export default authRoute
