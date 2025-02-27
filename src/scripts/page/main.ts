import '../../main.css'
import InfiniteCanvas, { Units } from 'ef-infinite-canvas'
import { createRenderer } from './renderer/create-renderer';
import { renderMap } from './render-map';
import { LocalStorageMapPersister } from './store/local-storage-map-persister';
import { createTicTacToeMap } from './content/map';
import { createThemeSwitch } from './themes/create-theme-switch';
import { createDarkThemePreferenceTracker } from './themes/create-dark-theme-preference-tracker';
import { createThemeAreaTracker } from './themes/theme-area-tracker';
import { LocalStorageThemePreferencePersister } from './themes/local-storage-theme-preference-persister';

function initialize(): void{
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    const infCanvas = new InfiniteCanvas(canvas, {units: Units.CSS, greedyGestureHandling: true});
    const channel = new BroadcastChannel('tictactoemap');
    const map = createTicTacToeMap(new LocalStorageMapPersister(), channel);
    renderMap(
        createRenderer(infCanvas.getContext('2d')),
        infCanvas,
        { width, height },
        map,
        createThemeSwitch(
            createThemeAreaTracker({width, height}, infCanvas),
            new LocalStorageThemePreferencePersister(),
            createDarkThemePreferenceTracker(),
            channel
        )
    )
    map.load();
}

initialize();