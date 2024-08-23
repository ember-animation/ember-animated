declare const _default: Readonly<typeof EmberObject> & (new (properties?: object | undefined) => {
    motion: null;
    duration: number;
    beforeAnimation(): void;
    afterAnimation(): void;
    run(...args: any[]): any;
    isAnimating: import("@ember/object/computed").default<unknown, unknown>;
    runner: ((proto: any, key: string) => any) & import("../-private/ember-scheduler.ts").TaskProperty;
} & EmberObject) & (new (...args: any[]) => {
    motion: null;
    duration: number;
    beforeAnimation(): void;
    afterAnimation(): void;
    run(...args: any[]): any;
    isAnimating: import("@ember/object/computed").default<unknown, unknown>;
    runner: ((proto: any, key: string) => any) & import("../-private/ember-scheduler.ts").TaskProperty;
} & EmberObject);
export default _default;
import EmberObject from '@ember/object';
//# sourceMappingURL=motion-tester.d.ts.map