import type { EventTargetLike } from "../events/types";
import type { Theme } from "./themes";

export interface ThemeSwitchEventMap {
    change: {}
}
export interface ThemeSwitchProperties {
    primaryTheme: Theme
    secondaryTheme: Theme
}
export interface ThemeSwitch extends ThemeSwitchProperties, EventTargetLike<ThemeSwitchEventMap> {

}