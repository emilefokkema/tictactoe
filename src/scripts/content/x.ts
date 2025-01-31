import { CustomPointerEventMap } from "../pointer-events/types"
import { GridCell } from "../ui/grid"

export interface XParent {
    notifyXDoubleClicked(): void
}

export class X {
    private readonly pointerDownListener: (ev: CustomPointerEventMap['pointerdown']) => void
    private readonly doubleClickListener: (ev: CustomPointerEventMap['dblclick']) => void

    public constructor(
        private readonly cell: GridCell,
        parent: XParent
    ){
        cell.displayX();
        this.pointerDownListener = (ev) => {
            ev.allowCancelDoubleClick();
        }
        cell.addEventListener('pointerdown', this.pointerDownListener);
        this.doubleClickListener = () => parent.notifyXDoubleClicked();
        cell.addEventListener('dblclick', this.doubleClickListener);
    }

    public destroy(): void {
        this.cell.removeEventListener('pointerdown', this.pointerDownListener);
        this.cell.removeEventListener('dblclick', this.doubleClickListener);
    }
}