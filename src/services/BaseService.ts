import axios from 'axios'
import appConfig from '@/configs/app.config'
import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '@/constants/api.constant'
import { useAuthStore } from '@/stores'

const unauthorizedCode = [401]

const BaseService = axios.create({
    timeout: 60000,
    baseURL: appConfig.apiPrefix,
})

BaseService.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token

        if (token) {
            config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${token}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

BaseService.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error

        if (response && unauthorizedCode.includes(response.status)) {
            useAuthStore.getState().signOutSuccess()
        }

        return Promise.reject(error)
    }
)

export default BaseService
