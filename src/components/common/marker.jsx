/*!
 * MLE.Client.Components.Common.Logo
 * File: logo.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';

/**
 * Generate map marker SVG.
 *
 * @public
 * @return string
 */

const getMarker = (type='single', fill='FFFFFF', text='n') => {

    // marker SVG templates
    const markers = {
        clusterIcon: `<svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 17.638889 21.166664"
        height="22"
        width="22">
        <circle fill="#FFFFFF" cx="9" cy="9" r="7"/>
        <g
            transform="translate(-78.115082,-80.886905)"
            id="layer1">
            <path
                fill="#000000"
                d="m 86.934522,80.886905 c -4.8701,0 -8.81944,3.876146 -8.81944,8.656287 0,4.855101 3.8585,8.173855 8.81944,12.510378 4.96094,-4.336523 8.81945,-7.655277 8.81945,-12.510378 0,-4.780141 -3.94935,-8.656287 -8.81945,-8.656287 z m 0,15.875 c -3.89731,0 -7.05555,-3.159125 -7.05555,-7.055555 0,-3.896431 3.15824,-7.055556 7.05555,-7.055556 3.89731,0 7.05556,3.159125 7.05556,7.055556 0,3.89643 -3.15825,7.055555 -7.05556,7.055555 z"
            />
        </g>
        <text
            x="50%"
            y="55%"
            fill="#000000"
            font-weight="bold"
            font-family="sans-serif"
            font-size="10px"
            text-anchor="middle">N</text>
    </svg>`,
        cluster: `<svg
                           xmlns="http://www.w3.org/2000/svg"
                           viewBox="0 0 17.638889 21.166664"
                           height="80"
                           width="80">
                            <circle fill="#FFFFFF" cx="9" cy="9" r="7"/>
                          <g
                             transform="translate(-78.115082,-80.886905)"
                             id="layer1">
                            <path
                               fill="#${fill}"
                               d="m 86.934522,80.886905 c -4.8701,0 -8.81944,3.876146 -8.81944,8.656287 0,4.855101 3.8585,8.173855 8.81944,12.510378 4.96094,-4.336523 8.81945,-7.655277 8.81945,-12.510378 0,-4.780141 -3.94935,-8.656287 -8.81945,-8.656287 z m 0,15.875 c -3.89731,0 -7.05555,-3.159125 -7.05555,-7.055555 0,-3.896431 3.15824,-7.055556 7.05555,-7.055556 3.89731,0 7.05556,3.159125 7.05556,7.055556 0,3.89643 -3.15825,7.055555 -7.05556,7.055555 z"
                                />
                          </g>
                            <text
                                x="50%"
                                y="50%"
                                fill="#444444"
                                font-weight="bold"
                                font-family="sans-serif"
                                font-size="6px"
                                text-anchor="middle">
                                ${text}
                            </text>
                        </svg>`,
        single: `<svg
                           xmlns="http://www.w3.org/2000/svg"
                           viewBox="0 0 17.638889 21.166664"
                           height="50"
                           width="50">
                            <circle fill="#00C6BB" cx="9" cy="9" r="7"/>
                          <g
                             transform="translate(-78.115082,-80.886905)"
                             id="layer1">
                            <path
                                fill="#${fill}"
                               d="m 86.934522,80.886905 c -4.8701,0 -8.81944,3.876146 -8.81944,8.656287 0,4.855101 3.8585,8.173855 8.81944,12.510378 4.96094,-4.336523 8.81945,-7.655277 8.81945,-12.510378 0,-4.780141 -3.94935,-8.656287 -8.81945,-8.656287 z m 0,15.875 c -3.89731,0 -7.05555,-3.159125 -7.05555,-7.055555 0,-3.896431 3.15824,-7.055556 7.05555,-7.055556 3.89731,0 7.05556,3.159125 7.05556,7.055556 0,3.89643 -3.15825,7.055555 -7.05556,7.055555 z"
                                />
                          </g>
                        </svg>`,
    };

    return markers.hasOwnProperty(type)
        ? markers[type]
        : <></>
};

export default getMarker;
