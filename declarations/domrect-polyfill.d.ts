declare function nonEnumerable(target: any, propertyKey: string): void;
declare class DOMRectPolyfill implements DOMRect {
    static fromRect(rect?: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    }): DOMRect;
    constructor(x?: number, y?: number, width?: number, height?: number);
    x: number;
    y: number;
    width: number;
    height: number;
    get top(): number;
    get right(): number;
    get bottom(): number;
    get left(): number;
    toJSON(): {
        x: number;
        y: number;
        width: number;
        height: number;
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}
//# sourceMappingURL=domrect-polyfill.d.ts.map