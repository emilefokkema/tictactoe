import { EventTargetLike } from "../events/types";
import { Theme } from "./themes";

export interface ThemeSwitchEventMap {
    change: {}
}
export interface ThemeSwitchProperties {
    primaryTheme: Theme
    secondaryTheme: Theme
}
export interface ThemeSwitch extends ThemeSwitchProperties, EventTargetLike<ThemeSwitchEventMap> {

}