import { ThemePreference, ThemePreferencePersister } from "./theme-preference-persister";

const localStorageKey = 'theme';

export function readThemeFromLocalStorage(): string | null {
    return window.localStorage.getItem(localStorageKey);
}

export class LocalStorageThemePreferencePersister implements ThemePreferencePersister{
    public persist(preference: ThemePreference): void {
        window.navigator.locks.request(
            'updatelocalstoragetheme',
            {
                mode: 'exclusive',
                ifAvailable: true
            },
            (lock) => {
                if(!lock){
                    return;
                }
                if(preference === null){
                    window.localStorage.removeItem(localStorageKey);
                }else{
                    window.localStorage.setItem(localStorageKey, preference);
                }
            }
        )
    }
    public read(): string | null {
        return readThemeFromLocalStorage();
    }
}