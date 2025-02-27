import { ThemeVariant } from "./theme-variant";

export function otherVariant(variant: ThemeVariant): ThemeVariant {
    return variant === 'dark' ? 'light' : 'dark';
}