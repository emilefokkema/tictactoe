import type { Renderable } from "../renderer/types";
import type { Theme } from "../themes";
import type { Themeable } from "../ui";

export interface Drawable extends Renderable, Themeable<Theme>{}