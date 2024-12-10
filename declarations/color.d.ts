import './element-remove.ts';
export declare class Color {
    readonly sourceString: string;
    static fromComputedStyle(colorString: string): Color;
    static fromUserProvidedColor(colorString: string): Color;
    toString(): string;
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
    constructor({ r, g, b, a }: {
        r: number;
        g: number;
        b: number;
        a: number;
    }, sourceString: string);
}
export declare class ColorTween {
    private rTween;
    private gTween;
    private bTween;
    private aTween;
    constructor(initialColor: Color, finalColor: Color, duration: number, easing?: (time: number) => number);
    get currentValue(): Color;
    get done(): boolean;
}
//# sourceMappingURL=color.d.ts.map