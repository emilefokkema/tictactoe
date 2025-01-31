export interface EventTargetLike<TMap>{
    addEventListener<TType extends keyof TMap>(type: TType, handler: (ev: TMap[TType]) => void): void
    removeEventListener<TType extends keyof TMap>(type: TType, handler: (ev: TMap[TType]) => void): void
}