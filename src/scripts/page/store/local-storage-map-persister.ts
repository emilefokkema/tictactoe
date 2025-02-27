import { SerializedTree } from "../state/serialization";
import { MapPersister } from "./map-persister";

const POSITIONS = 'positions';

export class LocalStorageMapPersister implements MapPersister {
    public persist(map: SerializedTree): void {
        const stringified = JSON.stringify(map);
        window.localStorage.setItem(POSITIONS, stringified);
    }
    public read(): SerializedTree | undefined {
        const storedValue = window.localStorage.getItem(POSITIONS);
        if(storedValue === null){
            return;
        }
        return JSON.parse(storedValue);
    }
}