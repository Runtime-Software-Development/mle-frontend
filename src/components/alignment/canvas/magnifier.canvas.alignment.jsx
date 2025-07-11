/*!
 * MLE.Client.Tools.Toolkit.Magnifier
 * File: magnifier.canvas.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React, {forwardRef, useRef, useImperativeHandle } from 'react';
import {getScale, inRange, scalePoint} from "../tools/scaler.alignment";
import {useIat} from "../../../providers/alignment.provider.client";

/**
 * Image Analysis Toolkit: Magnifier component
 */

const MagnifierTool = forwardRef(function Canvas(props, ref) {

    const canvasRef = useRef(null);
    const iat = useIat();

    // initialize magnifier configuration
    // - set size of magnifier scope in rendered pixels
    const scopeDims = {w: 120, h: 120};

    useImperativeHandle(ref, () => {
        const context = canvasRef.current.getContext('2d', { willReadFrequently: true });
        // draw control point to magnifier
        const drawCtrlPt = (viewCtrlPt, index, colour) => {
            // get position
            const x = viewCtrlPt.x;
            const y = viewCtrlPt.y;
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
        return {
            magnify: (image, panel) => {

                // clear magnification canvas
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                // get the current canvas position
                const pos = panel.pointer;
                // get any existing control points
                const controlPoints = panel.pointer.points;

                // compute position and scope size in offset render
                const _x = pos.x - panel.properties.render_dims.x;
                const _y = pos.y - panel.properties.render_dims.y;

                /*
                 * Compute the position within the magnified image
                 * - sourceX and sourceY assume the magnified area exists within the magnified image.
                 */
                const sourcePt = scalePoint(
                    {x: _x, y: _y},
                    panel.properties.magnified_dims,
                    panel.properties.render_dims
                );

                let sourceX = sourcePt.x - scopeDims.w / 2;
                let sourceY = sourcePt.y - scopeDims.h / 2;

                // set the top corner position of the magnifier scope
                const destX = pos.x - scopeDims.w / 2;
                const destY = pos.y - scopeDims.h / 2;

                // set inner view dimensions and position
                let viewWidth = scopeDims.w ;
                let viewHeight = scopeDims.h;
                let viewX = destX;
                let viewY = destY;
                let drawMagImage = true;


                // is the mouse over the image?
                if (
                    _x <= 0 ||
                    _y <= 0 ||
                    _x > panel.properties.render_dims.w ||
                    _y > panel.properties.render_dims.h
                ) drawMagImage = false;

                // // boundary checks and adjustments for cases
                // // where the magnifier goes past the edges of the large image
                // if (sourceX < 0) {
                //     if (sourceX > -1 * scopeDims.w ) {
                //         const diffX = -1 * sourceX;
                //         viewX += diffX;
                //         viewWidth -= diffX;
                //         sourceX = 0;
                //     }
                //     else {
                //         drawMagImage = false;
                //     }
                // }
                //
                // if (sourceX > largeWidth - scopeDims.w ) {
                //     if (sourceX < largeWidth) {
                //         viewWidth = largeWidth - sourceX;
                //     }
                //     else {
                //         drawMagImage = false;
                //     }
                // }
                //
                // if (sourceY < 0) {
                //     if (sourceY > -1 * scopeDims.h) {
                //         const diffY = -1 * sourceY;
                //         viewY += diffY;
                //         viewHeight -= diffY;
                //         sourceY = 0;
                //     }
                //     else {
                //         drawMagImage = false;
                //     }
                // }
                //
                // if (sourceY > largeHeight - scopeDims.h) {
                //     if (sourceY < largeHeight) {
                //         viewHeight = largeHeight - sourceY;
                //     }
                //     else {
                //         drawMagImage = false;
                //     }
                // }

                // draw image
                if (drawMagImage && image) {

                    // draw white magnifier background
                    context.beginPath();
                    context.fillStyle = "white";
                    context.fillRect(destX, destY, scopeDims.w , scopeDims.h);
                    context.beginPath();
                    // draw magnified scope
                    // DEBUG
                    // console.log(
                    //     `Magnifier: \nsource: x: ${sourcePt.x}, y: ${sourcePt.y}, \nsource left-top x: ${sourceX}, y: ${sourceY}
                    //     \nview x: ${viewX}, y: ${viewY}, w: ${viewWidth}, h: ${viewHeight}`);

                    context.drawImage(image, sourceX, sourceY, viewWidth, viewHeight, viewX, viewY, viewWidth, viewHeight);
                    // draw magnifier border
                    context.beginPath();
                    context.lineWidth = 2;
                    context.strokeStyle = "black";
                    context.strokeRect(destX, destY, scopeDims.w , scopeDims.h);
                    // draw cross-hair
                    context.beginPath();
                    context.lineWidth = 1;
                    context.strokeStyle = "cyan";
                    context.moveTo(destX + scopeDims.w / 2, destY);
                    context.lineTo(destX + scopeDims.w / 2, destY + scopeDims.h);
                    context.moveTo(destX, destY + scopeDims.h / 2);
                    context.lineTo(destX + scopeDims.w, destY + scopeDims.h / 2);
                    context.stroke();
                    // draw control points in range of magnifier
                    const radius = scopeDims.w / 2;
                    // control points on current panel
                    controlPoints.forEach((ctrlPt, index) => {
                        // compute magnified position of control point
                        const sourceCtrlPt = scalePoint(ctrlPt, panel.properties.magnified_dims, panel.properties.image_dims);
                        // compute view position of control point
                        const viewCtrlPt = {
                            x: destX + scopeDims.w / 2 - (sourcePt.x - sourceCtrlPt.x),
                            y: destY + scopeDims.h / 2 - (sourcePt.y - sourceCtrlPt.y)
                        };

                        // scale control point to render view
                        if (inRange(sourcePt.x, sourcePt.y, sourceCtrlPt.x, sourceCtrlPt.y, radius)) {
                            drawCtrlPt(viewCtrlPt, index, 'magenta');
                        }
                    });
                    // control points on other panel
                    if (panel.properties.overlay) {
                        const panelID = panel.properties.id === 'panel1' ? 'panel2' : 'panel1';
                        const otherPanel = iat[panelID];
                        // redraw points on overlay canvas
                        otherPanel.pointer.points.forEach((ctrlPt, index) => {
                            // compute magnified position of control point
                            const sourceCtrlPt = scalePoint(ctrlPt, panel.properties.magnified_dims, panel.properties.image_dims);
                            // compute view position of control point
                            const viewCtrlPt = {
                                x: destX + scopeDims.w / 2 - (sourcePt.x - sourceCtrlPt.x),
                                y: destY + scopeDims.h / 2 - (sourcePt.y - sourceCtrlPt.y)
                            };

                            // scale control point to render view
                            if (inRange(sourcePt.x, sourcePt.y, sourceCtrlPt.x, sourceCtrlPt.y, radius)) {
                                drawCtrlPt(viewCtrlPt, index, 'cyan');
                            }
                        });
                    }
                }


            },
            clear: () => {
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            },
        };
    }, []);

    return <canvas {...props} ref={canvasRef}/>;
});

export default MagnifierTool;
