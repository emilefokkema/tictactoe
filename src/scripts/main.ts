import '../main.css'
import InfiniteCanvas, { Units } from 'ef-infinite-canvas'
import { createRenderer } from './renderer/create-renderer';
import { createMap } from './create-map';
import { createStore } from './store/create-store';
import { TicTacToeLocalStorage } from './store/tictactoe-local-storage';

function initialize(): void{
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    const infCanvas = new InfiniteCanvas(canvas, {units: Units.CSS, greedyGestureHandling: true});
    const renderer = createRenderer(infCanvas.getContext('2d'));
    const store = createStore();
    const ticTacToeLocalStorage = new TicTacToeLocalStorage();
    store.connectStore(ticTacToeLocalStorage);
    createMap(
        renderer,
        infCanvas,
        { width, height },
        store
    )
    ticTacToeLocalStorage.load();
}

initialize();