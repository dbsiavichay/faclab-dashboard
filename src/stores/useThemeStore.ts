import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { themeConfig } from '@/configs/theme.config'
import {
    LAYOUT_TYPE_MODERN,
    LAYOUT_TYPE_CLASSIC,
    LAYOUT_TYPE_STACKED_SIDE,
    NAV_MODE_TRANSPARENT,
    NAV_MODE_LIGHT,
    NAV_MODE_DARK,
    NAV_MODE_THEMED,
    MODE_DARK,
    MODE_LIGHT,
    LAYOUT_TYPE_DECKED,
} from '@/constants/theme.constant'
import type {
    LayoutType,
    Mode,
    NavMode,
    ColorLevel,
    Direction,
} from '@/@types/theme'

const availableNavColorLayouts = [
    LAYOUT_TYPE_CLASSIC,
    LAYOUT_TYPE_STACKED_SIDE,
    LAYOUT_TYPE_DECKED,
]

const initialNavMode = () => {
    if (
        themeConfig.layout.type === LAYOUT_TYPE_MODERN &&
        themeConfig.navMode !== NAV_MODE_THEMED
    ) {
        return NAV_MODE_TRANSPARENT
    }
    return themeConfig.navMode
}

export interface ThemeState {
    // State
    themeColor: string
    direction: Direction
    mode: Mode
    primaryColorLevel: ColorLevel
    panelExpand: boolean
    navMode: NavMode
    cardBordered: boolean
    layout: {
        type: LayoutType
        sideNavCollapse: boolean
        previousType?: LayoutType
    }

    // Actions
    setDirection: (direction: Direction) => void
    setMode: (mode: Mode) => void
    setLayout: (type: LayoutType) => void
    setPreviousLayout: (type: LayoutType) => void
    setSideNavCollapse: (collapse: boolean) => void
    setNavMode: (mode: NavMode | 'default') => void
    setPanelExpand: (expand: boolean) => void
    setThemeColor: (color: string) => void
    setThemeColorLevel: (level: ColorLevel) => void
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            // Initial state
            themeColor: themeConfig.themeColor,
            direction: themeConfig.direction,
            mode: themeConfig.mode,
            primaryColorLevel: themeConfig.primaryColorLevel,
            panelExpand: themeConfig.panelExpand,
            cardBordered: themeConfig.cardBordered,
            navMode: initialNavMode(),
            layout: themeConfig.layout,

            // Actions
            setDirection: (direction) => set({ direction }),

            setMode: (mode) => {
                const state = get()
                const availableColorNav = availableNavColorLayouts.includes(
                    state.layout.type
                )

                let newNavMode = state.navMode

                if (
                    availableColorNav &&
                    mode === MODE_DARK &&
                    state.navMode !== NAV_MODE_THEMED
                ) {
                    newNavMode = NAV_MODE_DARK
                }
                if (
                    availableColorNav &&
                    mode === MODE_LIGHT &&
                    state.navMode !== NAV_MODE_THEMED
                ) {
                    newNavMode = NAV_MODE_LIGHT
                }

                set({ mode, navMode: newNavMode })
            },

            setLayout: (type) => {
                const state = get()
                const cardBordered = type === LAYOUT_TYPE_MODERN
                let newNavMode = state.navMode

                if (type === LAYOUT_TYPE_MODERN) {
                    newNavMode = NAV_MODE_TRANSPARENT
                }

                const availableColorNav =
                    availableNavColorLayouts.includes(type)

                if (availableColorNav && state.mode === MODE_LIGHT) {
                    newNavMode = NAV_MODE_LIGHT
                }

                if (availableColorNav && state.mode === MODE_DARK) {
                    newNavMode = NAV_MODE_DARK
                }

                set({
                    cardBordered,
                    navMode: newNavMode,
                    layout: {
                        ...state.layout,
                        type,
                    },
                })
            },

            setPreviousLayout: (previousType) =>
                set((state) => ({
                    layout: {
                        ...state.layout,
                        previousType,
                    },
                })),

            setSideNavCollapse: (sideNavCollapse) =>
                set((state) => ({
                    layout: {
                        ...state.layout,
                        sideNavCollapse,
                    },
                })),

            setNavMode: (mode) => {
                const state = get()

                if (mode !== 'default') {
                    set({ navMode: mode })
                } else {
                    let newNavMode = state.navMode

                    if (state.layout.type === LAYOUT_TYPE_MODERN) {
                        newNavMode = NAV_MODE_TRANSPARENT
                    }

                    const availableColorNav = availableNavColorLayouts.includes(
                        state.layout.type
                    )

                    if (availableColorNav && state.mode === MODE_LIGHT) {
                        newNavMode = NAV_MODE_LIGHT
                    }

                    if (availableColorNav && state.mode === MODE_DARK) {
                        newNavMode = NAV_MODE_DARK
                    }

                    set({ navMode: newNavMode })
                }
            },

            setPanelExpand: (panelExpand) => set({ panelExpand }),

            setThemeColor: (themeColor) => set({ themeColor }),

            setThemeColorLevel: (primaryColorLevel) =>
                set({ primaryColorLevel }),
        }),
        {
            name: 'theme-storage',
        }
    )
)
