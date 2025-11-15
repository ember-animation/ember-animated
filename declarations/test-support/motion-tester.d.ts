declare const _default: Readonly<typeof EmberObject> & (new (owner?: import("@ember/-internals/owner").default) => EmberObject) & {
    motion: null;
    duration: number;
    beforeAnimation(): void;
    afterAnimation(): void;
    run(...args: any[]): any;
    isAnimating: import("@ember/-internals/metal/lib/alias").AliasDecorator;
    runner: ((proto: any, key: string) => any) & import("../-private/ember-scheduler.ts").TaskProperty;
};
export default _default;
import EmberObject from '@ember/object';
//# sourceMappingURL=motion-tester.d.ts.map