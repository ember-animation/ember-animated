export function animationsSettled(): Promise<undefined>;
export function bounds(element: any): DOMRect;
export function shape(element: any): {
    a: number;
    b: number;
    c: number;
    d: number;
};
export function boundsAndShape(element: any): {
    a: number;
    b: number;
    c: number;
    d: number;
};
export function visuallyConstant(target: any, fn: any, message: any): Promise<void>;
export function approxEqualColors(value: any, expected: any, message: any): void;
export function setupAnimationTest(hooks: any): void;
export { TimeControl };
export { default as MotionTester } from "./motion-tester.js";
export { default as Sprite } from "../-private/sprite.ts";
export { default as Motion } from "../-private/motion.ts";
export { AdjustColor } from "../motions/adjust-color.ts";
export { Move } from "../motions/move.ts";
export let time: any;
import TimeControl from './time-control.js';
//# sourceMappingURL=index.d.ts.map