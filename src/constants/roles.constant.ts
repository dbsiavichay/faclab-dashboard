export const ROLE = {
    ADMIN: 1,
    MANAGER: 2,
    OPERATOR: 3,
    VIEWER: 4,
    CASHIER: 5,
} as const

export type RoleCode = (typeof ROLE)[keyof typeof ROLE]

export const ROLE_LABELS: Record<RoleCode, string> = {
    [ROLE.ADMIN]: 'Administrador',
    [ROLE.MANAGER]: 'Gerente',
    [ROLE.OPERATOR]: 'Operador',
    [ROLE.VIEWER]: 'Consulta',
    [ROLE.CASHIER]: 'Cajero',
}

export const ROLE_NAMES: Record<RoleCode, string> = {
    [ROLE.ADMIN]: 'ADMIN',
    [ROLE.MANAGER]: 'MANAGER',
    [ROLE.OPERATOR]: 'OPERATOR',
    [ROLE.VIEWER]: 'VIEWER',
    [ROLE.CASHIER]: 'CASHIER',
}

export const ALL_ROLES: RoleCode[] = [
    ROLE.ADMIN,
    ROLE.MANAGER,
    ROLE.OPERATOR,
    ROLE.VIEWER,
    ROLE.CASHIER,
]
