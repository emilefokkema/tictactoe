import { Renderable } from "../renderer/types";
import { Theme } from "../themes/themes";
import { Themeable } from "../ui/themeable";

export interface Drawable extends Renderable, Themeable<Theme>{}