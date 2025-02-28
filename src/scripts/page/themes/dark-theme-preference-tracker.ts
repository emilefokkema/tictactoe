import type { EventTargetLike } from "../events/types"

export interface DarkThemePreferenceTrackerEventMap {
    change: {prefersDarkTheme: boolean}
}

export interface DarkThemePreferenceTracker extends EventTargetLike<DarkThemePreferenceTrackerEventMap> {
    prefersDarkTheme: boolean
}