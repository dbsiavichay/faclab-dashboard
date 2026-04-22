import appConfig from '@/configs/app.config'
import { authRequest, authRequestPaginated } from './AuthApiClient'
import type {
    AdminUserResponse,
    AdminUserListParams,
    CreateUserRequest,
    UpdateUserRoleRequest,
    ResetUserPasswordRequest,
} from '@/@types/auth'

const BASE = appConfig.adminUsersApiHost

const AdminUsersService = {
    listUsers: (params?: AdminUserListParams) =>
        authRequestPaginated<AdminUserResponse>({
            url: BASE,
            method: 'GET',
            params,
        }),

    getUser: (id: number) =>
        authRequest<AdminUserResponse>({ url: `${BASE}/${id}`, method: 'GET' }),

    createUser: (data: CreateUserRequest) =>
        authRequest<AdminUserResponse>({ url: BASE, method: 'POST', data }),

    updateRole: (id: number, data: UpdateUserRoleRequest) =>
        authRequest<AdminUserResponse>({
            url: `${BASE}/${id}/role`,
            method: 'PUT',
            data,
        }),

    activate: (id: number) =>
        authRequest<AdminUserResponse>({
            url: `${BASE}/${id}/activate`,
            method: 'POST',
        }),

    deactivate: (id: number) =>
        authRequest<AdminUserResponse>({
            url: `${BASE}/${id}/deactivate`,
            method: 'POST',
        }),

    resetPassword: (id: number, data: ResetUserPasswordRequest) =>
        authRequest<AdminUserResponse>({
            url: `${BASE}/${id}/reset-password`,
            method: 'POST',
            data,
        }),
}

export default AdminUsersService
