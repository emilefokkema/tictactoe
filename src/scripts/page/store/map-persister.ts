import { SerializedTree } from "../state/serialization";

export interface MapPersister {
    persist(map: SerializedTree): void;
    read(): SerializedTree | undefined;
}