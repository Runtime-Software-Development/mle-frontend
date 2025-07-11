/*!
 * MLE.Client.Tools.Toolkit.Canvas
 * File: default.canvas.alignment.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Canvas component for Alignment Tool. Allows for state-controlled interactions using Canvas API.
 *
 * ---------
 * Revisions
 * - 09-07-2023   Major upgrade to Toolkit incl. UI and workflow improvements and OpenCV integration
 * - 14-07-2023   Added support for TIFF downloads
 */

import React, {forwardRef, useRef, useImperativeHandle, useEffect} from 'react';
import {CanvasToTIFF} from "../utils/tiff.utils.alignment";

/**
 * Image Analysis Toolkit: Canvas component
 */

const Canvas = forwardRef(function Canvas(props, ref) {

    const canvasRef = useRef(null);
    const {onKeyDown, onKeyUp} = props || {};

    // add event listener for key events
    useEffect(()=>{
        if (onKeyDown && onKeyDown) {
            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp);
            return () => {
                document.removeEventListener("keydown", onKeyDown);
                document.removeEventListener("keyup", onKeyUp);
            };
        }
    }, [onKeyDown, onKeyUp])

    useImperativeHandle(ref, () => {
        const context = canvasRef.current.getContext('2d', { willReadFrequently: true });
        return {
            load: (image) => {

                if (!image) return;

                // load image data to image canvas
                canvasRef.current.width = image.width;
                canvasRef.current.height = image.height;

                // draw image to canvas
                if (image instanceof HTMLImageElement)
                    context.drawImage(image, 0, 0, image.width, image.height);
                else context.putImageData(image, 0, 0);
            },
            putImageData: (imageData, dims) => {

                /**
                 * Loads image data to canvas
                 * Note: Image size sets new data canvas dimensions
                 *
                 * @public
                 */

                // destructure dimensions
                const {x, y, w, h} = dims || {};

                // put image to canvas
                context.putImageData(imageData, x || 0, y || 0, 0, 0, w || imageData.width, h || imageData.height);
            },
            draw: (image, dims, clear=true) => {

                /**
                 * Redraws image data to canvas
                 * Note: Scale sets new data canvas dimensions
                 * - dx
                 *   The x-axis coordinate in the destination canvas at which to place the top-left
                 *   corner of the source image.
                 * - dy
                 *   The y-axis coordinate in the destination canvas at which to place the top-left
                 *   corner of the source image.
                 * - dWidth
                 *   The width to draw the image in the destination canvas. This allows scaling of the
                 *   drawn image. If not specified, the image is not scaled in width when drawn.
                 * - dHeight
                 *   The height to draw the image in the destination canvas. This allows scaling of
                 *   the drawn image. If not specified, the image is not scaled in height when drawn.
                 *
                 * @public
                 */

                if (!image) return;

                // clear, resize and render image data to canvas
                const {source, view} = dims || {};
                if (clear) context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                // set canvas dimensions
                // canvasRef.current.width = view && view.w || canvasRef.current.width;
                // canvasRef.current.height = view && view.h || canvasRef.current.height;
                // draw source image to canvas
                context.drawImage(
                    image,
                    (source && source.x) || 0,
                    (source && source.y) || 0,
                    (source && source.w) || image.width,
                    (source && source.h) || image.height,
                    (view && view.x) || 0,
                    (view && view.y) || 0,
                    (view && view.w),
                    (view && view.h)
                );
            },
            canvas: () => {
                return canvasRef.current;
            },
            context: () => {
                return context;
            },
            clear: () => {
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            },
            dims: () => {
                return {w: canvasRef.current.width, h: canvasRef.current.height};
            },
            setWidth: (value) => {
                canvasRef.current.width = value;
            },
            setHeight: (value) => {
                canvasRef.current.height = value;
            },
            bounds: () => {
                const rect = canvasRef.current.getBoundingClientRect();
                return {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                }
            },
            data: () => {
                return canvasRef.current.toDataURL('image/jpeg', 1.0);
            },
            getImageData: () => {
                return context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
            },
            blob: (image, type, quality, callback) => {
                // if image data is provided, load to canvas and convert to blob
                if (image) {
                    if (image instanceof HTMLImageElement)
                        context.drawImage(image, 0, 0, image.width, image.height);
                    else context.putImageData(image, 0, 0);
                }

                return type !== 'image/tiff'
                    ? canvasRef.current.toBlob(callback, type, quality)
                    : CanvasToTIFF.toBlob(canvasRef.current, callback);
            },
            alpha: (alpha) => {
                // set canvas opacity
                canvasRef.current.style.opacity = alpha;
            }
        };
    }, []);

    return <canvas {...props} ref={canvasRef} />;
});

export default Canvas;
