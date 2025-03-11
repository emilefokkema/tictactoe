import type { Renderable } from "../renderer/types";
import type { Theme } from "../themes";
import type { Grid } from "../ui/grid";

export interface RenderableGrid extends Grid<Theme>, Renderable {

}