import '../domrect-polyfill.ts';
/**
  Shifts the coordinates of the given bounds using the provided
  x and y axis offset.

  @private
  @function shiftedBounds
  @hide
  @param {Object} bounds The original bounds.
  @param {number} dx X axis offset.
  @param {number} dy Y axis offset.
  @return {Object} The newly calculated bounds.
*/
export declare function shiftedBounds(bounds: DOMRect, dx: number, dy: number): DOMRect;
/**
  Resizes the coordinates of the given bounds using the provided
  width and height.

  @private
  @function resizedBounds
  @hide
  @param {Object} bounds The original bounds.
  @param {number} width The target width.
  @param {number} height The target height.
  @return {Object} The newly calculated bounds.
*/
export declare function resizedBounds(bounds: DOMRect, width: number, height: number): DOMRect;
/**
  Shifts the coordinates of the given bounds so they are relative to
  the offset.

  @private
  @function relativeBounds
  @hide
  @param {Object} bounds The original bounds.
  @param {Object} offset The offset.
  @return {Object} The newly calculated bounds.
*/
export declare function relativeBounds(bounds: DOMRect, offset: {
    left: number;
    top: number;
}): DOMRect;
/**
  An empty bounds object.

  @private
  @hide
  @constant {Object} emptyBounds
*/
export declare const emptyBounds: Readonly<DOMRect>;
//# sourceMappingURL=bounds.d.ts.map