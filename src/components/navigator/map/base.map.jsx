/*!
 * MLE.Client.Components.Navigator.Map.Base
 * File: default.canvas.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Base Leaflet map component forMap Navigator.
 *
 * ---------
 * Revisions
 * -
 */

import React, {forwardRef, useRef, useImperativeHandle, useEffect} from 'react';

/**
 * Leaflet Map Component
 */

const LeafletMap = forwardRef(function Map(props, ref) {

    const mapRef = useRef(null);
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
        const context = mapRef.current.getContext('2d', { willReadFrequently: true });
        return {
            load: (image) => {

                if (!image) return;

                // load image data to image canvas
                mapRef.current.width = image.width;
                mapRef.current.height = image.height;

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
            draw: (image, dims) => {

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
                context.clearRect(0, 0, mapRef.current.width, mapRef.current.height);
                // set canvas dimensions
                // canvasRef.current.width = view && view.w || canvasRef.current.width;
                // canvasRef.current.height = view && view.h || canvasRef.current.height;
                // draw source image to canvas
                context.drawImage(
                    image,
                    source && source.x || 0,
                    source && source.y || 0,
                    source && source.w || image.width,
                    source && source.h || image.height,
                    view && view.x || 0,
                    view && view.y || 0,
                    view && view.w,
                    view && view.h
                );
            },
            canvas: () => {
                return mapRef.current;
            },
            context: () => {
                return context;
            },
            clear: () => {
                context.clearRect(0, 0, mapRef.current.width, mapRef.current.height);
            },
            dims: () => {
                return {w: mapRef.current.width, h: mapRef.current.height};
            },
            bounds: () => {
                const rect = mapRef.current.getBoundingClientRect();
                return {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                }
            },
            data: () => {
                return mapRef.current.toDataURL('image/jpeg', 1.0);
            },
            getImageData: () => {
                return context.getImageData(0, 0, mapRef.current.width, mapRef.current.height);
            },
            blob: (image, type, quality, callback) => {
                // if image data is provided, load to canvas and convert to blob
                if (image) {
                    if (image instanceof HTMLImageElement)
                        context.drawImage(image, 0, 0, image.width, image.height);
                    else context.putImageData(image, 0, 0);
                }

            },
            alpha: (alpha) => {
                // set canvas opacity
                mapRef.current.style.opacity = alpha;
            }
        };
    }, []);

    return <div {...props} ref={mapRef} style={{height: (winHeight - heightOffset) + 'px'}} />;

});

export default LeafletMap;
