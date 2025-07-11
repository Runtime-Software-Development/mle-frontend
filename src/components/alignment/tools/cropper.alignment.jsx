/*!
 * MLE.Client.Components.Toolkit.Cropper
 * File: cropper.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Crop tool to crop images in Image Toolkit panels.
 *
 * ---------
 * Revisions
 * - 26-07-2023   Added pointer parameter to pass pointer hook.
 */

import React from 'react';
import InputSelector from '../../selectors/input.selector';
import Button from '../../common/button';
import {getScale} from './scaler.alignment';
import {useIat} from "../../../providers/alignment.provider.client";


/**
 * Creates cropper control panel component.
 *
 * @param properties
 * @param callback
 * @param update
 * @return
 */

const CropTool = ({ id, callback, update, ptr=null, props=null }) => {

    const iat = useIat();

    // render dimensions
    const pointer = id ? iat[id].pointer : ptr;
    const properties = id ? iat[id].properties : props;
    const _imgW = properties.image_dims.w;
    const _imgH = properties.image_dims.h;

    // get current select box dimensions
    let _w = Math.abs(pointer.selectBox.w);
    let _h = Math.abs(pointer.selectBox.h);
    let _x = pointer.selectBox.x;
    let _y = pointer.selectBox.y;
    let updatedSelectBox = { x: _x, y: _y, w: _w, h: _h };

    // Handle dimensional changes
    const _handleChange = (e) => {
        e.preventDefault();

        const { target = {} } = e || {};
        const { name = '', value = '' } = target;
        const delta = parseInt(value);

        // update crop dimensions
        const crops = {
            x: () => {
                updatedSelectBox.x = Math.min(delta, _imgW);
            },
            y: () => {
                updatedSelectBox.y = Math.min(delta, _imgH);
            },
            w: () => {
                updatedSelectBox.w = Math.abs(Math.min(delta, _imgW));
            },
            h: () => {
                updatedSelectBox.h = Math.abs(Math.min(delta, _imgH));
            }
        }
        crops[name]();

        // Scale select box dimensions for canvas rendering
        const scaled = scaleSelectBox(updatedSelectBox, properties);

        // update pointer state and draw crop box to canvas
        pointer.setSelectBox(updatedSelectBox);
        update(scaled.x, scaled.y, scaled.w, scaled.h);
    };

    /**
     * Update selected control point to match other panel dimensions
     *
     * @private
     */

    const _handleMatch = () => {
        const updatedSelectBox = id === 'panel1' ? iat.panel2.properties.image_dims : iat.panel1.properties.image_dims;

        // Scale select box dimensions for canvas rendering
        const scaled = scaleSelectBox(updatedSelectBox, properties);

        // update pointer state and draw crop box to canvas
        pointer.setSelectBox(updatedSelectBox);
        update(scaled.x, scaled.y, scaled.w, scaled.h);

    }

    // is the crop box empty?
    const isEmptyCropBox = pointer.selectBox.w === 0 && pointer.selectBox.h === 0;

    return <div className={'canvas-view-controls'}>
        <fieldset className={'super_compact'}>
            <div className={'h-menu centered'}>
                <ul>
                    <li>
                        <Button
                            icon={'images'}
                            label={`Match`}
                            onClick={_handleMatch}
                        />
                    </li>
                    <li>
                        <InputSelector
                            disabled={isEmptyCropBox}
                            id={'crop_x'}
                            name={'x'}
                            label={'X'}
                            type={'int'}
                            value={updatedSelectBox.x}
                            min={0}
                            max={properties.image_dims.w}
                            onChange={_handleChange}
                        />
                    </li>
                    <li>
                        <InputSelector
                            id={'crop_y'}
                            disabled={isEmptyCropBox}
                            name={'y'}
                            label={'Y'}
                            type={'int'}
                            min={0}
                            max={properties.image_dims.h}
                            value={updatedSelectBox.y}
                            onChange={_handleChange}
                        />
                    </li>
                    <li>
                        <InputSelector
                            id={'crop_w'}
                            disabled={isEmptyCropBox}
                            name={'w'}
                            label={'W'}
                            type={'int'}
                            min={0}
                            max={properties.image_dims.w}
                            value={updatedSelectBox.w}
                            onChange={_handleChange}
                        />
                    </li>
                    <li>
                        <InputSelector
                            id={'crop_h'}
                            disabled={isEmptyCropBox}
                            name={'h'}
                            label={'H'}
                            type={'int'}
                            min={0}
                            max={properties.image_dims.h}
                            value={updatedSelectBox.h}
                            onChange={_handleChange}
                        />
                    </li>
                    <li>
                        <Button
                            disabled={isEmptyCropBox}
                            className={'success'}
                            icon={'crop'}
                            label={`Apply`}
                            onClick={callback}
                        />
                    </li>
                </ul>
            </div>
        </fieldset>
        </div>
}

export default CropTool;


/**
 * Scale selection by current render dimensions.
 * @param selectBox
 * @param properties
 */

const scaleSelectBox = (selectBox, properties) => {

    // get current render scale
    let scale = getScale(properties.image_dims, properties.render_dims);

    // compute scaled dimensions / coordinates
    const scaledSelectBox =
        {
            x: Math.round(selectBox.x * 1/scale.x),
            y: Math.round(selectBox.y * 1/scale.y),
            w: Math.abs(Math.round(selectBox.w * 1/scale.x)),
            h: Math.abs(Math.round(selectBox.h * 1/scale.y))
        };

    // adjust for negative select box dimensions
    if (scaledSelectBox.w < 0 ) {
        scaledSelectBox.w = Math.abs(scaledSelectBox.w);
        scaledSelectBox.x = scaledSelectBox.x - scaledSelectBox.w;
    }
    if (scaledSelectBox.h < 0 ) {
        scaledSelectBox.h = Math.abs(scaledSelectBox.h);
        scaledSelectBox.y = scaledSelectBox.y - scaledSelectBox.h;
    }

    return scaledSelectBox;
}

/**
 * Crop image by coordinates.
 *
 * @publicx
 * @param canvas
 * @param image
 * @param cropDims
 */

export const cropImage = (cv, canvas, image, cropDims) => {

    try {
        let src = cv.matFromImageData(image);

        // crop src -> dst image dimensions
        // compute region of interest (ROI)
        let rect = new cv.Rect(cropDims.x, cropDims.y, cropDims.w, cropDims.h);
        let dst = src.roi(rect);
    
        // use CV to load cropped image to canvas
        cv.imshow(canvas, dst);
    
        // convert to ImageData datatype and save to state
        // const dstData = new Uint8ClampedArray(dst.data);
        src.delete();
        dst.delete();
        // return new ImageData(dstData, cropDims.w, cropDims.h);
    } catch (err) {
        console.error(err);
    }   
    
}