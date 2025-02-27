import { ThemeVariant } from "./theme-variant";

export interface DerivedThemePreferencePersister {
    persist(preference: ThemeVariant): void
    read(): ThemeVariant
}