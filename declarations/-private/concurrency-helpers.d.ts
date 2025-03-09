interface iFrameState {
    nextFrame: number | null;
    currentFrameClock: number;
    nextFrameWaiters: {
        promise: Promise<any>;
        resolve: () => void;
    }[];
}
export declare const frameState: iFrameState;
export declare function registerCancellation(promise: Promise<any>, handler: (p: Promise<any>) => void): void;
export declare function fireCancellation(promise: Promise<any>): void;
export declare function rAF(): Promise<unknown>;
export declare function microwait(): Promise<void>;
export declare function wait(ms?: number): Promise<void>;
export declare function afterRender(): Promise<void>;
export declare let clock: {
    now(): number;
};
export declare function allSettled(promises: Promise<any>[]): Promise<any[]>;
export {};
//# sourceMappingURL=concurrency-helpers.d.ts.map