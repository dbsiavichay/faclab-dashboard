import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import appConfig from '@/configs/app.config'

interface LocaleState {
    // State
    currentLang: string

    // Actions
    setLang: (lang: string) => void
}

export const useLocaleStore = create<LocaleState>()(
    persist(
        (set) => ({
            // Initial state
            currentLang: appConfig.locale,

            // Actions
            setLang: (currentLang) => set({ currentLang }),
        }),
        {
            name: 'locale-storage',
        }
    )
)
