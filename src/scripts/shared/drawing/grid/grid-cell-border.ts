import type { Theme } from "../theme";
import { GridBorder } from "./grid-border";
import { GridBorderPart } from "./grid-border-part";

export class GridCellBorder {
    public constructor(
        private readonly border: GridBorder,
        private readonly part: GridBorderPart
    ){

    }

    public setTheme(theme: Theme): void{
        this.border.setPartialTheme(this.part, theme);
    }
}