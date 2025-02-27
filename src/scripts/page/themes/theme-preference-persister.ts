import { ThemeVariant } from "./theme-variant";

export type ThemePreference = ThemeVariant | null;

export interface ThemePreferencePersister {
    persist(preference: ThemePreference): void
    read(): string | null
}