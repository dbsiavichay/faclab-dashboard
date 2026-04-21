import type { Permission } from '@/constants/permissions.constant'
import type { RoleCode } from '@/constants/roles.constant'

export type ApiMeta = {
    requestId: string
    timestamp: string
    pagination?: {
        total: number
        limit: number
        offset: number
    }
}

export type ApiEnvelope<T> = {
    data: T
    meta: ApiMeta
}

export type ApiErrorItem = {
    code: string
    message: string
    field?: string | null
}

export type ApiErrorResponse = {
    errors: ApiErrorItem[]
    meta: ApiMeta
}

export type Session = {
    id: number
    username: string
    role: RoleCode
    permissions: Permission[]
    mustChangePassword: boolean
}

export type LoginRequest = {
    username: string
    password: string
}

export type LoginResponse = {
    accessToken: string
    refreshToken: string
    tokenType: 'Bearer'
    expiresIn: number
}

export type RefreshRequest = {
    refreshToken: string
}

export type RefreshResponse = LoginResponse

export type MeResponse = Session

export type ChangePasswordRequest = {
    currentPassword: string
    newPassword: string
}

export type AdminUserResponse = {
    id: number
    username: string
    email: string
    role: RoleCode
    isActive: boolean
    mustChangePassword: boolean
    lastLoginAt: string | null
    createdAt: string
}

export type AdminUserListParams = {
    limit?: number
    offset?: number
    isActive?: boolean
    role?: RoleCode
}

export type CreateUserRequest = {
    username: string
    email: string
    password: string
    role: RoleCode
}

export type UpdateUserRoleRequest = {
    role: RoleCode
}

export type ResetUserPasswordRequest = {
    newPassword: string
}
