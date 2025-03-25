export default class Transform {
    readonly a: number;
    readonly b: number;
    readonly c: number;
    readonly d: number;
    readonly tx: number;
    readonly ty: number;
    constructor(a: number, b: number, c: number, d: number, tx: number, ty: number);
    serialize(): string;
    isIdentity(): boolean;
    mult(other: Transform): Transform;
}
export declare const identity: Transform;
/**
  Returns a Transform instance representing the cumulative CSS
  transform of this element and all its ancestors.

  @function cumulativeTransform
  @hide
  @param {HTMLElement} elt
  @return {Transform}
*/
export declare function cumulativeTransform(elt: HTMLElement): Transform;
/**
  Returns a Transform instance representing the CSS transform of this
  element.

 * @function ownTransform
 * @param {HTMLElement} elt
 * @return {Transform} instance representing this element's css transform property.
 */
export declare function ownTransform(elt: HTMLElement): Transform;
//# sourceMappingURL=transform.d.ts.map