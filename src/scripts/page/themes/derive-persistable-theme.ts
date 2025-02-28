import type { DerivedThemePreferencePersister } from "./derived-theme-preference-persister";
import type { ThemePreferencePersister } from "./theme-preference-persister";
import type { ThemeVariant } from "./theme-variant";

export function derivePersistableTheme(
    prefersDarkTheme: boolean,
    persister: ThemePreferencePersister
): DerivedThemePreferencePersister {
    return {
        persist(theme: ThemeVariant): void {
            if(prefersDarkTheme){
                if(theme === 'dark'){
                    persister.persist(null);
                }else{
                    persister.persist('light');
                }
            }else{
                if(theme === 'dark'){
                    persister.persist('dark');
                }else{
                    persister.persist(null);
                }
            }
        },
        read(): ThemeVariant {
            const persisted = persister.read();
            if(persisted !== 'light' && persisted !== 'dark'){
                return prefersDarkTheme ? 'dark' : 'light';
            }
            return persisted;
        }
    }
}