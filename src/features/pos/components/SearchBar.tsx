import { useState, useEffect, type KeyboardEvent } from 'react'
import Input from '@/components/ui/Input'
import { HiOutlineSearch } from 'react-icons/hi'
import { isApiError } from '@/utils/errors/ApiError'
import { notifyError } from '@shared/ui/notify'
import { usePOSStore } from '../store/usePOSStore'
import { getProductByBarcode } from '../api/client'
import { toCartInput } from '../lib/cartLine'

const SearchBar = () => {
    const searchTerm = usePOSStore((s) => s.searchTerm)
    const setSearchTerm = usePOSStore((s) => s.setSearchTerm)
    const addItem = usePOSStore((s) => s.addItem)
    const [localTerm, setLocalTerm] = useState(searchTerm)

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(localTerm)
        }, 300)
        return () => clearTimeout(timer)
    }, [localTerm, setSearchTerm])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalTerm(searchTerm)
    }, [searchTerm])

    /**
     * Un lector de códigos escribe el código y Enter: se agrega la presentación
     * de ese código (la caja, con su precio) y se limpia la búsqueda. Si no es
     * un código, queda la búsqueda por nombre o SKU (S5.2).
     */
    const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return
        const code = localTerm.trim()
        if (!code) return
        event.preventDefault()
        try {
            const { data } = await getProductByBarcode(code)
            addItem(toCartInput(data.product, data.presentation))
            setLocalTerm('')
            setSearchTerm('')
        } catch (error: unknown) {
            if (isApiError(error) && error.status === 404) return
            notifyError(error, 'No se pudo buscar el código de barras')
        }
    }

    return (
        <div className="mb-3">
            <Input
                type="search"
                aria-label="Buscar productos"
                placeholder="Buscar por nombre, SKU o código de barras..."
                value={localTerm}
                prefix={<HiOutlineSearch className="text-lg" />}
                onChange={(e) => setLocalTerm(e.target.value)}
                onKeyDown={handleKeyDown}
            />
        </div>
    )
}

export default SearchBar
