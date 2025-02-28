import type { EventTargetLike } from "../events/types";
import type { ThemeVariant } from "./theme-variant";

export interface RemoteThemeSwitchEventMap {
    change: {theme: ThemeVariant}
}
export interface RemoteThemeSwitch extends EventTargetLike<RemoteThemeSwitchEventMap> {
    setTheme(theme: ThemeVariant): void
}