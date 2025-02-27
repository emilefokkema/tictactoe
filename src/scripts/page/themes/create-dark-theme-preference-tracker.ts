import { EventDispatcher } from "../events/event-dispatcher";
import { DarkThemePreferenceTracker, DarkThemePreferenceTrackerEventMap } from "./dark-theme-preference-tracker";

export function createDarkThemePreferenceTracker(): DarkThemePreferenceTracker {
    const queryList = window.matchMedia("(prefers-color-scheme: dark)");
    const eventDispatcher: EventDispatcher<DarkThemePreferenceTrackerEventMap> = new EventDispatcher({
        change: []
    })
    let prefersDarkTheme = queryList.matches;
    queryList.addEventListener('change', ({matches}) => {
        prefersDarkTheme = matches;
        eventDispatcher.dispatchEvent('change', {prefersDarkTheme})
    })
    return {
        get prefersDarkTheme(){return prefersDarkTheme;},
        addEventListener(type, handler) {
            eventDispatcher.addEventListener(type, handler)
        },
        removeEventListener(type, handler) {
            eventDispatcher.removeEventListener(type, handler);
        },
    }
}