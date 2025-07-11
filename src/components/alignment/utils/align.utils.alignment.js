/*!
 * MLE.Client.Utils.Alignment
 * File: align.utils.alignment.js
 * Copyright(c) 2024 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Alignment utility functions. 
 *
 * ---------
 * Revisions
 * - 25-09-2024   Updated the OpenCV library to opencv-wasm 2.0.0
 */

import * as math from "mathjs";
import { getError } from "../../../services/schema.services.client";
import { translateCVError } from "../panel/init.panel.alignment";

/**
 * Compute alignment transformation matrix image data.
 * - Uses four control points (x,y) given in each canvas
 * - Solves the linear problem H[x,y] = k[u,v] for h
 * - where  h = [h0, h1, h2, h3, h4, h5, h6, h7]
 *          x = [x0, x1, x2, x3], y = [y0, y1, y2, y3]
 *          u = [u0, u1, u2, u3], v = [v0, v1, v2, v3]
 *          p = [[x0, y0], [u0, v0], [x1, y1], [u1, v1],
 *              [x2, y2], [u2, v2], [x3, y3], [u4, v4]]
 * - The transformation matrix H is then defined as:
 *      H = |h0  h1  0  h2|
 *          |h3  h4  0  h5|
 *          |0   0   1   0|
 *          |h6  h7  0   1|
 *
 * Reference: https://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
 *
 * @public
 * @return {*[]}
 * @param from
 * @param to
 */

export const getAlignmentTransform = (from, to) => {

    // Ax = b
    let A = [];
    for (let i = 0; i < 4; i++) {
        A.push([from[i].x, from[i].y, 1, 0, 0, 0, -from[i].x * to[i].x, -from[i].y * to[i].x]);
        A.push([0, 0, 0, from[i].x, from[i].y, 1, -from[i].x * to[i].y, -from[i].y * to[i].y]);
    }

    // destination control point vector
    let b = [];
    for (let i = 0; i < 4; i++) {
        b.push(to[i].x);
        b.push(to[i].y);
    }

    // solve linear system for H
    let H = math.transpose(math.lusolve(A, b))[0];
    const H2 = [[H[0], H[1], H[2]], [H[3], H[4], H[5]], [H[6], H[7], 1]];

    // Sanity check that H actually maps `from` to `to`
    for (let i = 0; i < 4; i++) {
        const lhs = math.multiply(H2, math.transpose([from[i].x, from[i].y, 1]));
        const k = lhs[2];
        const z = [to[i].x, to[i].y, 1];
        const rhs = math.multiply(z, k);
        console.assert(math.norm(math.subtract(lhs, rhs)) < 1e-9, 'Not equal:', lhs, rhs);
    }
    return H;
};
/**
 * Apply alignment transformation matrix (homographic projection) to image data.
 * NOTE: input data is Uint32 typed array to store four one-byte values (red,
 * green, blue, and alpha, or "RGBA" format). Each pixel is assigned a
 * consecutive index within the array, with the top left pixel at index 0
 * which proceed from left to right, then downward, throughout the array.
 *
 * @public
 * @param {Array} H
 * @param {Uint32Array} src
 * @param {Uint32Array} dst
 * @param {int} w
 * @param {int} h
 */

export const warpImage = (H, src, dst, w, h) => {

    // compute array index
    // function idx(ix, iy, w) {
    //     return (Math.ceil(Math.max(ix + w * iy, 0)));
    // }

    const dstW = w;
    const dstH = h;
    // const srcW = w;
    // const srcH = h;
    let x, y, u, v, k;
    for (y = 0; y < dstH; ++y) {
        for (x = 0; x < dstW; ++x) {
            // transform coordinates
            k = x * H[6] + y * H[7] + 1;
            u = (x * H[0] + y * H[1] + H[2]) / k;
            u >>= 0;
            v = (x * H[3] + y * H[4] + H[5]) / k;
            v >>= 0;
            dst[x + w * y] = src[u + w * v];
        }
    }
};
/**
 * Transform images data for alignment.
 * - uses CV WASM image transformations
 *
 * @public
 * @param cv
 * @param srcPanel
 * @param dstPanel
 * @param canvas
 * @param targetImage
 * @param options
 */

export const alignImages = (cv, srcPanel, dstPanel, canvas, targetImage, options) => {
    try {
        // destructure image data
        const imgSrc = srcPanel.image;
        const imgDst = dstPanel.image;

        // init destination image
        // let srcW = imgSrc.width;
        // let srcH = imgSrc.height;

        // init destination image
        let dstData;
        let dstW = imgDst.width;
        let dstH = imgDst.height;

        // get control points
        const controlPoints1 = [...srcPanel.pointer.points];
        const controlPoints2 = [...dstPanel.pointer.points];

        // check control points preconditions
        if (!controlPoints1
            || controlPoints1.length < options.controlPtMax
            || !controlPoints2 || controlPoints2.length < options.controlPtMax) {
            return { data: null, error: { msg: getError('missingControlPoints', 'canvas'), type: 'error' } };
        }

        // check preconditions
        if (!imgSrc || !imgDst) {
            return { data: null, error: { msg: getError('emptyCanvas', 'canvas'), type: 'error' } };
        }

        // use OpenCV library for image transformations
        if (cv) {
            console.log('Applying OpenCV perspective transformation...');
            let initDstImage = cv.matFromImageData(targetImage);
            let dstImage = new cv.Mat();
            let dsize = new cv.Size(initDstImage.cols, initDstImage.rows);

            // DEBUG
            console.log('Source Image:', imgSrc)
            console.log('Target Image:', imgDst, dsize)

            // (data32F[0], data32F[1]) is the first point
            // (data32F[2], data32F[3]) is the second point
            // (data32F[4], data32F[5]) is the third point
            // (data32F[6], data32F[7]) is the fourth point
            let dstTri = new cv.matFromArray(controlPoints1.length, 1, cv.CV_32FC2, [
                controlPoints1[0].x,
                controlPoints1[0].y,
                controlPoints1[1].x,
                controlPoints1[1].y,
                controlPoints1[2].x,
                controlPoints1[2].y,
                controlPoints1[3].x,
                controlPoints1[3].y
            ]);

            let srcTri = new cv.matFromArray(controlPoints2.length, 1, cv.CV_32FC2, [
                controlPoints2[0].x,
                controlPoints2[0].y,
                controlPoints2[1].x,
                controlPoints2[1].y,
                controlPoints2[2].x,
                controlPoints2[2].y,
                controlPoints2[3].x,
                controlPoints2[3].y
            ]);

            // Find the homography matrix.
            // const homography = cv.findHomography(srcTri, dstTri, cv.RANSAC);
            const M = cv.getPerspectiveTransform(srcTri, dstTri);

            // DEBUG
            console.log('Transformation Matrix:', M)

            // Apply homography to image
            cv.warpPerspective(initDstImage, dstImage, M, dsize);

            // DEBUG
            console.log('Warping:', M, initDstImage, dstImage, dsize)

            // use CV to load aligned image to canvas
            cv.imshow(canvas, dstImage);

            // DEBUG
            console.log('Transformed Image Data', dstImage)

            // convert to ImageData datatype
            dstData = new Uint8ClampedArray(dstImage.data);

            // delete buffers
            initDstImage.delete();
            dstImage.delete();
            srcTri.delete();
            dstTri.delete();
        } else {
            // compute alignment transformation matrix
            const transform = getAlignmentTransform(controlPoints1, controlPoints2);

            // convert 8 Bit Clamped RGBA order to 32 Bit Array
            let src = new Uint32Array(imgDst.data.buffer);
            let dst = new Uint32Array(src.length);

            // apply transformation to image 2 (dst) loaded in right-hand panel (Panel 2)
            warpImage(transform, src, dst, imgDst.width, imgDst.height);

            // convert back to 8 Bit Clamped RGBA array
            dstData = new Uint8ClampedArray(dst.buffer);
        }

        // convert destination image data to ImageData object
        return { data: new ImageData(dstData, dstW, dstH), error: null };
    } catch (err) {
        console.error(translateCVError(err), err);
    }
};


/**
 * Computes Pearson's coefficient of correlation for given coordinates.
 *
 * @param pts {Array} coordinate pairs in the form of objects with x and y properties
 * @return {Number} correlation coefficient, 1 for perfect positive correlation, -1 for perfect negative correlation, 0 for no correlation
 */
export function correlation(pts) {
    if (pts.length < 2) return 0;
    let x = pts.map(pt => pt.x);
    let y = pts.map(pt => pt.y);
    /**
     * Helper function to calculate the mean of an array
     * @param l {Array} array of numbers
     * @return {Number} mean of the array
     */
    const promedio = l => l.reduce((s, a) => s + a, 0) / l.length;
    /**
     * Helper function to calculate the standard deviation of an array
     * @param v {Array} array of numbers
     * @param prom {Number} mean of the array
     * @return {Number} standard deviation of the array
     */
    const calc = (v, prom) => Math.sqrt(v.reduce((s, a) => (s + a * a), 0) - n * prom * prom)
    let n = x.length
    let nn = 0
    for (let i = 0; i < n; i++, nn++) {
        if ((!x[i] && x[i] !== 0) || (!y[i] && y[i] !== 0)) {
            nn--
            continue
        }
        x[nn] = x[i]
        y[nn] = y[i]
    }
    if (n !== nn) {
        x = x.splice(0, nn)
        y = y.splice(0, nn)
        n = nn
    }
    const prom_x = promedio(x), prom_y = promedio(y)
    return (x
        .map((e, i) => ({ x: e, y: y[i] }))
        .reduce((v, a) => v + a.x * a.y, 0) - n * prom_x * prom_y
    ) / (calc(x, prom_x) * calc(y, prom_y))
}
