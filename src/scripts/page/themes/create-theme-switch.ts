import { EventDispatcher } from "../events/event-dispatcher";
import { createRemoteThemeSwitch } from "./create-remote-theme-switch";
import type { DarkThemePreferenceTracker } from "./dark-theme-preference-tracker";
import { derivePersistableTheme } from "./derive-persistable-theme";
import type { DerivedThemePreferencePersister } from "./derived-theme-preference-persister";
import { otherVariant } from "./other-variant";
import type { RemoteThemeSwitch } from "./remote-theme-switch";
import type { ThemeAreaTracker } from "./theme-area-tracker";
import type { ThemePreferencePersister } from "./theme-preference-persister";
import type { ThemeSwitch, ThemeSwitchEventMap, ThemeSwitchProperties } from "./theme-switch";
import type { ThemeVariant } from "./theme-variant";
import { darkTheme, lightTheme, type Theme } from "./themes";

interface ThemeSwitchState extends ThemeSwitchProperties{
    onPrimaryArea(primary: boolean): ThemeSwitchState
    withDarkThemePreference(prefersDarkTheme: boolean): ThemeSwitchState
    withThemeFromRemote(theme: ThemeVariant): ThemeSwitchState
}

interface InitialThemeSwitchState extends ThemeSwitchProperties {
    getThemeSwitch(themeAreaTracker: ThemeAreaTracker): ThemeSwitch
}

function themeForVariant(variant: ThemeVariant): Theme {
    return variant === 'dark' ? darkTheme : lightTheme;
}

function createThemeSwitchState(
    persister: ThemePreferencePersister,
    derivedPersister: DerivedThemePreferencePersister,
    remoteSwitch: RemoteThemeSwitch,
    theme: ThemeVariant,
    onPrimaryArea: boolean
): ThemeSwitchState{
    const primaryVariant = onPrimaryArea ? theme : otherVariant(theme);
    const secondaryVariant = onPrimaryArea ? otherVariant(theme) : theme;
    const primaryTheme = themeForVariant(primaryVariant);
    const secondaryTheme = themeForVariant(secondaryVariant);
    return {
        primaryTheme,
        secondaryTheme,
        onPrimaryArea(onPrimaryArea: boolean): ThemeSwitchState {
            const newTheme = onPrimaryArea ? primaryVariant : secondaryVariant;
            derivedPersister.persist(newTheme);
            remoteSwitch.setTheme(newTheme);
            return createThemeSwitchState(
                persister,
                derivedPersister,
                remoteSwitch,
                newTheme,
                onPrimaryArea
            )
        },
        withDarkThemePreference(prefersDarkTheme: boolean): ThemeSwitchState {
            const newDerived = derivePersistableTheme(prefersDarkTheme, persister);
            const newTheme = newDerived.read();
            newDerived.persist(newTheme);
            return createThemeSwitchState(
                persister,
                newDerived,
                remoteSwitch,
                newTheme,
                onPrimaryArea
            )
        },
        withThemeFromRemote(theme: ThemeVariant): ThemeSwitchState {
            return createThemeSwitchState(
                persister,
                derivedPersister,
                remoteSwitch,
                theme,
                onPrimaryArea
            )
        }
    }
}

export function createInitialThemeSwitchState(
    persister: ThemePreferencePersister,
    darkThemePreferenceTracker: DarkThemePreferenceTracker,
    channel: BroadcastChannel
): InitialThemeSwitchState {
    const remoteSwitch = createRemoteThemeSwitch(channel);
    const derived = derivePersistableTheme(darkThemePreferenceTracker.prefersDarkTheme, persister);
    derived.persist(derived.read());
    const initialState = createThemeSwitchState(
        persister,
        derived,
        remoteSwitch,
        derived.read(),
        true
    );
    return {
        get primaryTheme(){return initialState.primaryTheme},
        get secondaryTheme(){return initialState.secondaryTheme},
        getThemeSwitch(themeAreaTracker){
            let state = initialState;
            const eventDispatcher: EventDispatcher<ThemeSwitchEventMap> = new EventDispatcher({change: []});
            remoteSwitch.addEventListener('change', ({theme}) => {
                state = state.withThemeFromRemote(theme);
                eventDispatcher.dispatchEvent('change', {});
            })
            themeAreaTracker.addEventListener('change', ({primary}) => {
                state = state.onPrimaryArea(primary);
                eventDispatcher.dispatchEvent('change', {});
            });
            darkThemePreferenceTracker.addEventListener('change', ({prefersDarkTheme}) => {
                state = state.withDarkThemePreference(prefersDarkTheme);
                eventDispatcher.dispatchEvent('change', {})
            });
            return {
                get primaryTheme(){return state.primaryTheme;},
                get secondaryTheme(){return state.secondaryTheme;},
                addEventListener(type, handler) {
                    eventDispatcher.addEventListener(type, handler)
                },
                removeEventListener(type, handler) {
                    eventDispatcher.removeEventListener(type, handler)
                },
            }
        }
    }
}

