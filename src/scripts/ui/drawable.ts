import { Renderable } from "../renderer/types"
import { Theme } from "../themes"

export interface Drawable extends Renderable{
    setTheme(theme: Theme): void
}