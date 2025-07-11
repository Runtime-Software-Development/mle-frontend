/*!
 * MLE.Client.Toolkit.Transform
 * File: scaler.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

/**
 * Computes scale-to-fit dimensions to fit an image [ix, iy]
 * inside a canvas [cx, cy].
 *
 *
 * @public
 * @return {Object} dimensions
 */

export const scaleToFit = (ix, iy, cx, cy) => {
    // epsilon for stability
    const eps = 1e-6;
    const ri = ix / (iy + eps);
    const rc = cx / (cy + eps);
    return {
        w: Math.round(rc > ri ? ix * cy/(iy + eps) : cx),
        h: Math.round(rc > ri ? cy : iy * cx/(ix + eps))
    };
};

/**
 * Returns in-range function for 2D coordinate.
 *
 * @public
 * @param x
 * @param y
 * @param u
 * @param v
 * @param radius
 */

export function inRange(x, y, u, v, radius) {
    return (u - (x + radius)) * (u - (x - radius)) < 0
        && (v - (y + radius)) * (v - (y - radius)) < 0;
}

/**
 * Get the current image scaling factors.
 *
 * @public
 * @param sourceDims
 * @param targetDims
 */

export const getScale = (sourceDims, targetDims) => {
    // set denominator divide-by-zero epsilon
    const eps = 0.0000000001;
    // compute image scaling coefficient
    return {
        x: targetDims.w > 0 ? ((sourceDims.w + eps) / (targetDims.w + eps)) : 1.0,
        y: targetDims.h > 0 ? ((sourceDims.h + eps) / (targetDims.h + eps)) : 1.0
    }
}

/**
 * Scale coordinate by image resize dimensions.
 *
 * @public
 * @param pt
 * @param sourceDims
 * @param targetDims
 */

export const scalePoint = (pt, sourceDims, targetDims) => {

    // get image scaling coefficient
    const scale = getScale(sourceDims, targetDims);

    // compute actual pixel position in image
    return {
        x: Math.round(pt.x * scale.x),
        y: Math.round(pt.y * scale.y)
    };
}

