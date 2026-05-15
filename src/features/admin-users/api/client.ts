import appConfig from '@/configs/app.config'
import { authRequest, authRequestPaginated } from '@shared/lib/http/authClient'
import type {
    AdminUserResponse,
    AdminUserListParams,
    CreateUserRequest,
    UpdateUserRoleRequest,
    ResetUserPasswordRequest,
} from '@/@types/auth'

const BASE = appConfig.adminUsersApiHost

export const listUsers = (params?: AdminUserListParams) =>
    authRequestPaginated<AdminUserResponse>({
        url: BASE,
        method: 'GET',
        params,
    })

export const getUser = (id: number) =>
    authRequest<AdminUserResponse>({ url: `${BASE}/${id}`, method: 'GET' })

export const createUser = (data: CreateUserRequest) =>
    authRequest<AdminUserResponse>({ url: BASE, method: 'POST', data })

export const updateRole = (id: number, data: UpdateUserRoleRequest) =>
    authRequest<AdminUserResponse>({
        url: `${BASE}/${id}/role`,
        method: 'PUT',
        data,
    })

export const activateUser = (id: number) =>
    authRequest<AdminUserResponse>({
        url: `${BASE}/${id}/activate`,
        method: 'POST',
    })

export const deactivateUser = (id: number) =>
    authRequest<AdminUserResponse>({
        url: `${BASE}/${id}/deactivate`,
        method: 'POST',
    })

export const resetPassword = (id: number, data: ResetUserPasswordRequest) =>
    authRequest<AdminUserResponse>({
        url: `${BASE}/${id}/reset-password`,
        method: 'POST',
        data,
    })
