export default class Child<T = unknown> {
    readonly group: string;
    readonly id: string;
    readonly value: T;
    readonly index: number;
    state: 'new' | 'kept' | 'removing';
    private removalBlockers;
    private removalCycle;
    constructor(group: string, id: string, value: T, index: number);
    block(cycle: number): void;
    unblock(cycle: number): void;
    flagForRemoval(): void;
    get shouldRemove(): boolean;
    clone(): Child<T>;
}
//# sourceMappingURL=child.d.ts.map