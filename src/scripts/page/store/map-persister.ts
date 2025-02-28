import type { SerializedTree } from "@shared/state/serialization";

export interface MapPersister {
    persist(map: SerializedTree): void;
    read(): SerializedTree | undefined;
}