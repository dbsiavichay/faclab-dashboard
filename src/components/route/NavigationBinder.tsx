import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setNavigator } from '@/services/navigationRef'

const NavigationBinder = () => {
    const navigate = useNavigate()

    useEffect(() => {
        setNavigator((path, options) => navigate(path, options))
        return () => setNavigator(null)
    }, [navigate])

    return null
}

export default NavigationBinder
