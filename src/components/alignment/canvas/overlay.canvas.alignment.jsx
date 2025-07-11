/*!
 * MLE.Client.Tools.Toolkit.Overlay
 * File: overlay.canvas.alignment.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React, {forwardRef, useRef, useImperativeHandle, useEffect} from 'react';

/**
 * Image Analysis Toolkit: Canvas component
 */

const Overlay = forwardRef(function Canvas(props, ref) {

    const canvasRef = useRef(null);
    const {onKeyDown, onKeyUp} = props || {};

    /**
     * Draw all selected control points on to mask canvas.
     *
     * @public
     * @param context
     * @param x
     * @param y
     * @param index
     * @param colour
     */

    const _drawControlPoint = (context, x, y, index, colour='magenta') => {

        // draw cross-hair
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = colour;
        context.moveTo(x - 30, y);
        context.lineTo(x + 30, y);
        context.moveTo(x, y - 30);
        context.lineTo(x, y + 30);
        context.stroke();

        // draw number background
        context.beginPath();
        context.fillStyle = 'lime';
        context.rect(x + 3, y + 6, 15, 15);
        context.fill();

        // write control point index
        context.font = '1em sans-serif';
        context.fillStyle = 'black';
        context.fillText(String(index + 1), x + 7, y + 17);

        // write bounding box
        context.beginPath();
        context.fillStyle = 'rgba(255,255,255,0.1)';
        context.rect(x - 30, y - 30, 60, 60);
        context.fill();
    }

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
            drawControlPoints: (points, colour) => {

                // clear canvas
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                // draw separate control points for panel
                (points || []).forEach((pt, index) => {
                    _drawControlPoint(context, pt.x, pt.y, index, colour);
                });
            },
            drawBoundingBox: (x, y, width, height) => {

                // clear canvas
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                // draw bounding box
                context.beginPath();
                context.strokeStyle = 'white';
                context.fillStyle = 'rgba(0,255,255,0.3)';
                context.strokeRect(x, y, width, height);
                context.rect(x, y, width, height);
                context.fill();
            },
            clear: () => {
                // clear canvas
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            },
            dims: () => {
                return {w: canvasRef.current.width, h: canvasRef.current.height};
            },
            bounds: () => {
                return canvasRef.current.getBoundingClientRect();
            }
        };
    }, []);

    return <canvas {...props} ref={canvasRef} />;
});

export default Overlay;
