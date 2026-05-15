import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/client'
import type {
    AdminUserListParams,
    CreateUserRequest,
    UpdateUserRoleRequest,
    ResetUserPasswordRequest,
} from '@/@types/auth'
import type { RoleCode } from '@/constants/roles.constant'

const USERS_KEY = ['admin-users'] as const

export const useAdminUsers = (params?: AdminUserListParams) =>
    useQuery({
        queryKey: [...USERS_KEY, params],
        queryFn: () => api.listUsers(params),
    })

export const useCreateAdminUser = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateUserRequest) => api.createUser(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
    })
}

export const useUpdateUserRole = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, role }: { id: number; role: RoleCode }) =>
            api.updateRole(id, { role } as UpdateUserRoleRequest),
        onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
    })
}

export const useActivateUser = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.activateUser(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
    })
}

export const useDeactivateUser = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.deactivateUser(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
    })
}

export const useResetUserPassword = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            newPassword,
        }: {
            id: number
            newPassword: string
        }) =>
            api.resetPassword(id, {
                newPassword,
            } as ResetUserPasswordRequest),
        onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
    })
}
