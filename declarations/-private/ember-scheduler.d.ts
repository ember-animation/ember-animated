type HostObject = Record<string, any>;
export declare function task(taskFn: (...args: any[]) => Generator): ((proto: any, key: string) => any) & TaskProperty;
declare let BaseTaskProperty: {
    new (): HostObject;
};
type BufferPolicy = (task: Task, priv: TaskPrivate) => Promise<void> | void;
export declare class TaskProperty extends BaseTaskProperty {
    _bufferPolicy: BufferPolicy | undefined;
    private _observes;
    restartable(): this;
    drop(): this;
    observes(...deps: string[]): this;
    setup(proto: HostObject, taskName: string): void;
}
interface TaskPrivate {
    context: HostObject;
    implementation: (...args: unknown[]) => Generator;
    instances: Promise<void>[];
    taskProperty: TaskProperty;
    name: string;
}
export declare class Task {
    concurrency: number;
    isRunning: boolean;
    constructor(context: any, implementation: TaskPrivate['implementation'], taskProperty: TaskProperty, name: string);
    perform(...args: unknown[]): Promise<any>;
    cancelAll(): void;
    _addInstance(i: Promise<void>): void;
    _removeInstance(i: Promise<void>): void;
    _safePerform(): void;
}
export declare function timeout(ms: number): Promise<void>;
export {};
//# sourceMappingURL=ember-scheduler.d.ts.map