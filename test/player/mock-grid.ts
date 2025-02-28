import Table, { type TableConstructorOptions } from 'cli-table3'
import type { CustomPointerEventMap } from "@page/pointer-events/types";
import type { Grid, GridCell } from "@page/ui";
import type { Winner } from "@shared/winner";
import type { TestPlayerContext } from './test-player';
import { MockTheme } from '../mock-theme';

type Mark = 'X' | 'O';

const mockGridTableOptions: TableConstructorOptions = {
    chars: {
        top: '', 'top-right': '', 'top-left': '', 'top-mid': '',
        bottom: '', 'bottom-right': '', 'bottom-left': '', 'bottom-mid': '',
        left: '', 'left-mid': '', right: '', 'right-mid': '',
        mid: '-', 'mid-mid': '+', middle: '|'
    },
    style: {
        'padding-right': 0,
        'padding-left': 0,
        border: []
    }
}

const listTableOptions: TableConstructorOptions = {
    chars: {
        top: '', 'top-left': '', 'top-mid': '', 'top-right': '',
        bottom: '', 'bottom-left': '', 'bottom-mid': '', 'bottom-right': '',
        left: '', 'left-mid': '', 'right': '', 'right-mid': '',
        mid: ' ', middle: '', 'mid-mid': ''
    },
    style: {
        'padding-right': 2,
        'padding-left': 0,
        border: []
    }
}

export class MockGridCell implements GridCell<MockTheme>, TestPlayerContext {
    private winner = false;
    private listeners: {[Key in keyof CustomPointerEventMap]: ((ev: CustomPointerEventMap[Key]) => void)[]} = {
        pointerdown: [],
        click: [],
        clickcancel: [],
        dblclick: [],
        dblclickcancel: []
    };
    private content: Mark | MockGrid | undefined;
    public get grid(): MockGrid {
        if(this.content instanceof MockGrid){
            return this.content;
        }
        throw new Error(`Content is not a grid`)
    }

    public isEmpty(): boolean {return this.content === undefined;}

    public displayX(): void {
        this.content = 'X';
    }

    public clear(): void{
        this.content = undefined;
    }

    public setWinner(){
        this.winner = true;
    }

    public findByPosition(position: number[]): MockGridCell | undefined {
        if(!this.content || !(this.content instanceof MockGrid)){
            return undefined;
        }
        return this.content.findByPosition(position);
    }

    public *getAllGrids(): Iterable<MockGrid> {
        if(!this.content || !(this.content instanceof MockGrid)){
            return;
        }
        yield *this.content.getAllGrids();
    }

    public displayO(): void {
        this.content = 'O';
    }

    public displayGrid(): Grid<MockTheme> {
        return this.content = new MockGrid();
    }

    public addEventListener<TType extends keyof CustomPointerEventMap>(type: TType, listener: (ev: CustomPointerEventMap[TType]) => void): void {
        this.listeners[type].push(listener)
    }
    public removeEventListener<TType extends keyof CustomPointerEventMap>(type: TType, listener: (ev: CustomPointerEventMap[TType]) => void): void {
        const listenerArray = this.listeners[type];
        const index = listenerArray.indexOf(listener);
        if(index === -1){
            return;
        }
        listenerArray.splice(index, 1);
    }
    public click(): void {
        this.dispatch('click', {type: 'click'});
    }
    public dblclick(): void {
        this.dispatch('dblclick', {type: 'dblclick'});
    }
    public dispatch<TType extends keyof CustomPointerEventMap>(type: TType, event: CustomPointerEventMap[TType]): void {
        for(const listener of this.listeners[type].slice()){
            listener(event);
        }
    }
    public toString(allGrids?: MockGrid[]): string {
        if(!this.content){
            return '';
        }
        if(typeof this.content === 'string'){
            return `${this.content}${this.winner ? '!': ''}`;
        }
        if(!allGrids){
            return '';
        }
        const index = allGrids.indexOf(this.content) + 1;
        return index.toString();
    }
}
export class MockGrid implements Grid<MockTheme>, TestPlayerContext {
    public theme = new MockTheme();
    private readonly mockCells: readonly [MockGridCell, MockGridCell, MockGridCell, MockGridCell, MockGridCell, MockGridCell, MockGridCell, MockGridCell, MockGridCell]
    public get cells(){return this.mockCells;}
    public get grid(): MockGrid {return this;}
    public constructor(){
        this.mockCells = [
            new MockGridCell(),
            new MockGridCell(),
            new MockGridCell(),
            new MockGridCell(),
            new MockGridCell(),
            new MockGridCell(),
            new MockGridCell(),
            new MockGridCell(),
            new MockGridCell(),
        ]
    }

    public setTheme(theme: MockTheme): void{
        this.theme = theme;
    }

    public getThemeString(): string {
        return this.theme ? `${this.theme}` : '';
    }

    public displayWinner(winner: Winner | undefined): void {
        if(!winner){
            return;
        }
        for(const position of winner.three.positions){
            this.mockCells[position].setWinner();
        }
    }

    public findByPosition(position: number[]): MockGridCell | undefined {
        const cellAtFirst = this.mockCells[position[0]];
        if(position.length === 1){
            return cellAtFirst;
        }
        return cellAtFirst.findByPosition(position.slice(1))
    }

    public *getAllGrids(): Iterable<MockGrid> {
        yield this;
        for(const cell of this.mockCells){
            yield *cell.getAllGrids();
        }
    }

    public toGridString(allGrids: MockGrid[]): string {
        const table = new Table(mockGridTableOptions);
        table.push([this.mockCells[0].toString(allGrids), this.mockCells[1].toString(allGrids), this.mockCells[2].toString(allGrids)] )
        table.push([this.mockCells[3].toString(allGrids), this.mockCells[4].toString(allGrids), this.mockCells[5].toString(allGrids)] )
        table.push([this.mockCells[6].toString(allGrids), this.mockCells[7].toString(allGrids), this.mockCells[8].toString(allGrids)] )
        return table.toString();
    }

    public toString(): string {
        const allGrids = [...this.getAllGrids()];
        const allGridsWithIndices = allGrids.map((grid, index) => ({grid, index}))
        const rowLength = 7;
        const numberOfRows = Math.ceil(allGrids.length / rowLength);
        const table = new Table(listTableOptions);
        for(let rowIndex = 0; rowIndex < numberOfRows; rowIndex++){
            table.push(allGridsWithIndices.slice(rowIndex * rowLength, (rowIndex + 1) * rowLength).map(({grid, index}) => `${index + 1}: ${grid.getThemeString()}\n${grid.toGridString(allGrids)}`))
        }
        return '\n' + table.toString();
    }
}