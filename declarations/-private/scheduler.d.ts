export declare function spawn(genFn: () => Generator): Promise<any>;
export declare function spawnChild(genFn: () => Generator): Promise<any>;
export declare function stop(microRoutinePromise: Promise<any>): void;
export declare function logErrors(fn: (err: Error) => void): void;
export declare function current(): Promise<any> | undefined;
export declare function childrenSettled(): Promise<any[]>;
export declare function parallel(...functions: ((...args: any[]) => unknown)[]): (...args: any[]) => Promise<unknown[]>;
export declare function serial(...functions: ((...args: any[]) => unknown)[]): (...args: any[]) => Promise<any>;
//# sourceMappingURL=scheduler.d.ts.map