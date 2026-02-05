import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import {
    apiSignIn,
    apiSignUp,
    apiSignOut,
    apiForgotPassword,
    apiResetPassword,
} from '@/services/AuthService'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
} from '@/@types/auth'

// Hook para Sign In
export function useSignIn() {
    const { signInSuccess } = useAuthStore()

    return useMutation({
        mutationFn: (credentials: SignInCredential) => apiSignIn(credentials),
        onSuccess: (response) => {
            if (response.data.token && response.data.user) {
                signInSuccess(response.data.token, response.data.user)
            }
        },
    })
}

// Hook para Sign Up
export function useSignUp() {
    const { signInSuccess } = useAuthStore()

    return useMutation({
        mutationFn: (credentials: SignUpCredential) => apiSignUp(credentials),
        onSuccess: (response) => {
            if (response.data.token && response.data.user) {
                signInSuccess(response.data.token, response.data.user)
            }
        },
    })
}

// Hook para Sign Out
export function useSignOut() {
    const { signOutSuccess } = useAuthStore()

    return useMutation({
        mutationFn: () => apiSignOut(),
        onSuccess: () => {
            signOutSuccess()
        },
    })
}

// Hook para Forgot Password
export function useForgotPassword() {
    return useMutation({
        mutationFn: (data: ForgotPassword) => apiForgotPassword(data),
    })
}

// Hook para Reset Password
export function useResetPassword() {
    return useMutation({
        mutationFn: (data: ResetPassword) => apiResetPassword(data),
    })
}
