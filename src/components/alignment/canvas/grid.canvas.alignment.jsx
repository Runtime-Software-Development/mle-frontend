/*!
 * MLE.Client.Tools.Toolkit.Grid
 * File: grid.canvas.alignment.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React, { forwardRef, useRef, useImperativeHandle } from 'react';
// import originMark from "../../svg/origin.svg";
// import xTicks from "../../svg/x-ticks.svg";
// import yTicks from "../../svg/y-ticks.svg";
import baseGrid from "../../svg/grid.svg";

/**
 * Image Analysis Toolkit: Canvas component
 */

const Grid = forwardRef(function Canvas(props, ref) {

    const canvasRef = useRef(null);

    useImperativeHandle(ref, () => {
        return {
            init: (scale) => {
                canvasRef.current.style.backgroundImage = `url(${baseGrid})`;
                canvasRef.current.style.backgroundRepeat = 'repeat';
                canvasRef.current.style.backgroundPosition = 'top left';
                canvasRef.current.style.backgroundSize = ` 
                ${Math.floor(200 / scale.x)}px ${Math.floor(200 / scale.y)}px`;
            },
            // init: (scale) => {
            //     canvasRef.current.style.backgroundImage = `url(${originMark}), url(${xTicks}), url(${yTicks}), url(${baseGrid})`;
            //     canvasRef.current.style.backgroundRepeat = 'no-repeat, repeat-x, repeat-y, repeat';
            //     canvasRef.current.style.backgroundPosition = 'bottom right, bottom left, top right, top left';
            //     canvasRef.current.style.backgroundSize = `
            //     auto,
            //     ${Math.round(100 / scale.x)}px 10px,
            //     10px ${Math.round(100 / scale.y)}px,
            //     ${Math.floor(200 / scale.x)}px ${Math.floor(200 / scale.y)}px`;
            // },
        }
    }, []);

    return <canvas {...props} ref={canvasRef} />;
});

export default Grid;
