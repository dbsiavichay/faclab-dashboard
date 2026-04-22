import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AdminUsersService from '@/services/AdminUsersService'
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
        queryFn: () => AdminUsersService.listUsers(params),
    })

export const useCreateAdminUser = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateUserRequest) =>
            AdminUsersService.createUser(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
    })
}

export const useUpdateUserRole = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, role }: { id: number; role: RoleCode }) =>
            AdminUsersService.updateRole(id, { role } as UpdateUserRoleRequest),
        onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
    })
}

export const useActivateUser = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => AdminUsersService.activate(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
    })
}

export const useDeactivateUser = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => AdminUsersService.deactivate(id),
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
            AdminUsersService.resetPassword(id, {
                newPassword,
            } as ResetUserPasswordRequest),
        onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
    })
}
