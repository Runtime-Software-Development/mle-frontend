/*!
 * MLE.Client.Tools.Toolkit.Comparator
 * File: comparator.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Dialog to compare panel images loaded in Alignment Tool. The images are
 * aligned to each other and overlayed on top of each other. The images can be
 * cropped to match the panel dimensions.
 *
 * ---------
 * Revisions
 * - 14-07-2023   Added reset button to restore original positions of images.
 * - 24-07-2023   Added crop feature to match cropping on both panel images.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import InputSelector from '../../selectors/input.selector';
import { useIat } from "../../../providers/alignment.provider.client";
import Canvas from "../canvas/default.canvas.alignment";
import { getScale, scalePoint, scaleToFit } from "./scaler.alignment";
import { getPos, usePointer } from "./pointer.alignment";
import Button from "../../common/button";
import baseGrid from "../../svg/grid.svg";
import Grid from "../canvas/grid.canvas.alignment";
import CropTool, { cropImage } from "./cropper.alignment";
import Badge from "../../common/badge";
import Overlay from "../canvas/overlay.canvas.alignment";


/**
 * Comparator component for comparing and overlaying Alignment Tool panel images
 *
 * @public
 * @param callback
 * @return {JSX.Element}
 */

export const ComparatorTool = ({
    callback = () => {
    }
}) => {

    const iat = useIat();

    const [status, setStatus] = React.useState('empty');

    // comparator mode
    const [mode, setMode] = useState('move');

    // define comparator canvas dimensions
    const comparatorDims = { w: 1000, h: 800 }

    // define canvas layers
    const controlLayer = useRef(null);
    const overlayLayer = useRef(null);
    const renderLayer1 = useRef(null);
    const renderLayer2 = useRef(null);
    const imageLayer1 = useRef(null);
    const imageLayer2 = useRef(null);
    const gridLayer = useRef(null);

    const _mounted = useRef(false);

    // panel scale
    const [scale, setScale] = useState(1.0);

    // panel 1 properties
    const [properties1, setProperties1] = useState(null);

    // panel 2 properties
    const [properties2, setProperties2] = useState(null);

    // selected properties
    const [properties, setProperties] = useState(null);

    // comparator mode
    const [topLayer, setTopLayer] = useState(0);

    // top layer opacity state
    const [opacity, setOpacity] = useState(100);

    // define the panel pointer
    const pointer = usePointer(properties, iat.options);

    /**
     * Load image data in comparator panel
     *
     * @private
     */

    const load = () => {
        // load data into image layers
        imageLayer1.current.load(iat.panel1.image);
        imageLayer2.current.load(iat.panel2.image);

        // compute scaled dimensions to fit view canvas
        const viewDims1 = scaleToFit(
            iat.panel1.properties.image_dims.w,
            iat.panel1.properties.image_dims.h,
            comparatorDims.w,
            comparatorDims.h,
        );

        // draw top layer view
        renderLayer1.current.draw(imageLayer1.current.canvas(), {
            view: { x: 0, y: 0, w: viewDims1.w, h: viewDims1.h },
            source: { x: 0, y: 0, w: iat.panel1.properties.image_dims.w, h: iat.panel1.properties.image_dims.h }
        });

        // get common scale
        // - use panel 1 image dimensions
        const scale = getScale(viewDims1, iat.panel1.properties.image_dims);

        // compute scaled dimensions to fit view canvas
        const viewDims2 = {
            w: Math.round(scale.x * iat.panel2.properties.image_dims.w),
            h: Math.round(scale.y * iat.panel2.properties.image_dims.h)
        };

        // draw bottom layer views
        renderLayer2.current.draw(imageLayer2.current.canvas(), {
            view: { x: 0, y: 0, w: viewDims2.w, h: viewDims2.h },
            source: { x: 0, y: 0, w: iat.panel2.properties.image_dims.w, h: iat.panel2.properties.image_dims.h }
        });

        // set comparator properties
        const bounds = controlLayer.current.bounds();
        const props1 = {
            base_dims: comparatorDims,
            bounds: bounds,
            image_dims: iat.panel1.properties.image_dims,
            render_dims: { x: 0, y: 0, w: viewDims1.w, h: viewDims1.h }
        };
        const props2 = {
            base_dims: comparatorDims,
            bounds: bounds,
            image_dims: iat.panel1.properties.image_dims,
            render_dims: { x: 0, y: 0, w: viewDims2.w, h: viewDims2.h }
        };
        setProperties1(props1);
        setProperties2(props2);
        setProperties(props1);
        setScale(scale.x);
        setStatus('loaded');
    }

    /**
     * Handle canvas reset to initial position and opacity
     * - reset pointer to (0, 0)
     */

    const reset = (e) => {
        e.preventDefault();
        // reset pointer
        pointer.reset();
        pointer.setSelect(null);
        // reload images
        load();
        // reset opacity
        setOpacity(100);
        renderLayer1.current.alpha(1.0);
        renderLayer2.current.alpha(1.0);
        // reset top layer toggle
        setTopLayer(0);
        // reset crop box
        pointer.setSelectBox({ x: 0, y: 0, w: 0, h: 0 });
        overlayLayer.current.drawBoundingBox(0, 0, 0, 0);
    };

    /**
     * Saves current images as panel
     */

    const save = () => {
        try {
            // store image data as current
            iat.panel1.setImage(imageLayer1.current.getImageData());
            iat.panel2.setImage(imageLayer2.current.getImageData());
            // store image data as source
            // iat.panel1.setSource(imageLayer1.current.getImageData());
            // iat.panel2.setSource(imageLayer2.current.getImageData());
            // update panel properties
            iat.panel1.setProperties(prevState => ({
                ...prevState,
                image_dims: properties1.image_dims,
                render_dims: properties1.render_dims,
                // source_dims: properties1.image_dims,
            }));
            iat.panel2.setProperties(prevState => ({
                ...prevState,
                image_dims: properties2.image_dims,
                render_dims: properties2.render_dims,
                // source_dims: properties1.image_dims,
            }));
            // update panel status to trigger redraw
            iat.panel1.setStatus('update');
            iat.panel2.setStatus('update');
            iat.setMessage({ msg: 'Comparator images updated to panel.', type: 'success' });
        } catch (err) {
            console.error(err);
            setStatus('error');
        } finally { }
    };


    /**
     * Crop image by pointer selected dimensions.
     * - sets image source data to the (x,y) offset and (w,h) dimensions
     *   of the selected crop box to draw to the render canvas.
     */

    const crop = () => {
        try {
            // check that mouse start position was selected
            if (!pointer.selectBox) return;

            // is the crop box empty? If so, return.
            if (pointer.selectBox.w === 0 && pointer.selectBox.h === 0) return;

            // compute down scale
            const scaleUp = getScale(properties.image_dims, properties.render_dims);

            // adjust crop selectBox offset to incorporate image offset
            const actualCroppedDims1 = {
                x: pointer.selectBox.x - (scaleUp.x * properties1.render_dims.x),
                y: pointer.selectBox.y - (scaleUp.y * properties1.render_dims.y),
                w: pointer.selectBox.w,
                h: pointer.selectBox.h
            }
            const actualCroppedDims2 = {
                x: pointer.selectBox.x - (scaleUp.x * properties2.render_dims.x),
                y: pointer.selectBox.y - (scaleUp.y * properties2.render_dims.y),
                w: pointer.selectBox.w,
                h: pointer.selectBox.h
            }

            // compute down scale
            const scaleDown = getScale(properties.render_dims, properties.image_dims);

            // define rendered crop dimensions
            const renderCroppedDims = {
                x: 0,
                y: 0,
                w: scaleDown.x * pointer.selectBox.w,
                h: scaleDown.y * pointer.selectBox.h
            }

            // crop image and draw to image layer canvases
            cropImage(imageLayer1.current.canvas(), iat.panel1.image, actualCroppedDims1);
            cropImage(imageLayer2.current.canvas(), iat.panel2.image, actualCroppedDims2);

            // render cropped images in view layer
            renderLayer1.current.draw(imageLayer1.current.canvas(), {
                view: renderCroppedDims,
                source: { x: 0, y: 0, w: pointer.selectBox.w, h: pointer.selectBox.h }
            });
            renderLayer2.current.draw(imageLayer2.current.canvas(), {
                view: renderCroppedDims,
                source: { x: 0, y: 0, w: pointer.selectBox.w, h: pointer.selectBox.h }
            });

            // update panel state
            setProperties1(prevState => ({
                ...prevState,
                image_dims: { w: pointer.selectBox.w, h: pointer.selectBox.h },
                render_dims: renderCroppedDims
            }));
            setProperties2(prevState => ({
                ...prevState,
                image_dims: { w: pointer.selectBox.w, h: pointer.selectBox.h },
                render_dims: renderCroppedDims
            }));

            // set top layer properties
            setProperties(prevState => ({
                ...prevState,
                image_dims: { w: pointer.selectBox.w, h: pointer.selectBox.h },
                render_dims: renderCroppedDims
            }));

            // reset selection box
            pointer.setSelectBox({ x: 0, y: 0, w: 0, h: 0 });
            // reset overlay
            overlayLayer.current.drawBoundingBox(0, 0, 0, 0);
        }
        catch (e) {
            console.error(e);
            iat.setMessage({ msg: 'Images could not be cropped.', type: 'error' });
        }
    }

    /**
     * Move crop bounding box.
     *
     * @public
     * @param e
     * @param properties
     * @param pointer
     */

    const cropMove = (e, properties, pointer) => {

        // set cursor position
        pointer.set(e);

        // check that mouse start position was selected
        if (!pointer.selected) return;

        e.preventDefault();

        // compute down scale
        const scaleDown = getScale(properties.render_dims, properties.image_dims);

        // compute new coordinates using distance travelled
        const _x = Math.round(scaleDown.x * pointer.selectBox.x) + pointer.x - pointer.selected.x;
        const _y = Math.round(scaleDown.y * pointer.selectBox.y) + pointer.y - pointer.selected.y;
        const _w = Math.round(scaleDown.x * pointer.selectBox.w);
        const _h = Math.round(scaleDown.y * pointer.selectBox.h);

        // compute up scale
        const scaleUp = getScale(properties.image_dims, properties.render_dims);

        // update the pointer select box
        // - use magnitude value of width/height
        pointer.setSelectBox({
            x: Math.round(scaleUp.x * _x),
            y: Math.round(scaleUp.y * _y),
            w: pointer.selectBox.w,
            h: pointer.selectBox.h
        });

        // update crop box boundary
        overlayLayer.current.drawBoundingBox(_x, _y, _w, _h);

        // update the pointer selected point
        pointer.setSelect({ x: pointer.x, y: pointer.y });
    }


    /**
     * Start image crop bounding box.
     *
     * @param e
     * @param properties
     * @param pointer
     * @public
     */

    const cropStart = (e, properties, pointer) => {
        pointer.set(e);
        // scale point coordinate
        const scaledPt = scalePoint(pointer, properties.image_dims, properties.render_dims);
        // determine if pointer coordinate is inside crop box
        const inRange =
            pointer.selectBox.w > 0 && pointer.selectBox.h > 0 &&
            scaledPt.x >= pointer.selectBox.x && scaledPt.x <= pointer.selectBox.x + pointer.selectBox.w &&
            scaledPt.y >= pointer.selectBox.y && scaledPt.y <= pointer.selectBox.y + pointer.selectBox.h;

        // start crop box boundary
        pointer.select(e);

        // if inside box, operation is to move the existing crop box
        if (inRange) {
            setMethods({
                onMouseDown: cropStart,
                onMouseUp: cropEnd,
                onMouseMove: cropMove,
                onMouseOut: cropEnd
            });
        }
        // otherwise start new crop box
        else {
            pointer.setSelectBox({ x: scaledPt.x, y: scaledPt.y, w: 0, h: 0 });
            overlayLayer.current.drawBoundingBox(0, 0, 0, 0);
        }
    }

    /**
     * convenience method for ending crop box selection
     *
     * @param e
     * @param properties
     * @param pointer
     * */

    const cropEnd = (e, properties, pointer) => {

        // select top layer properties
        // set pointer select box to image overlap if dimensionless or out-of-bounds of image
        const _x = Math.round(Math.max(Math.min(pointer.selectBox.x, properties.image_dims.w), 0));
        const _y = Math.round(Math.max(Math.min(pointer.selectBox.y, properties.image_dims.h), 0));

        // check if crop box goes outside bounds of image and crop to area that overlaps
        const _w = pointer.selectBox.x + pointer.selectBox.w > properties.image_dims.w
            ? properties.image_dims.w - Math.abs(pointer.selectBox.x)
            : pointer.selectBox.x < 0
                ? pointer.selectBox.w - Math.abs(pointer.selectBox.x)
                : pointer.selectBox.w;
        const _h = pointer.selectBox.y + pointer.selectBox.h > properties.image_dims.h
            ? properties.image_dims.h - Math.abs(pointer.selectBox.y)
            : pointer.selectBox.y < 0
                ? pointer.selectBox.h - Math.abs(pointer.selectBox.y)
                : pointer.selectBox.h;

        // update the pointer select box
        pointer.setSelectBox({ x: _x, y: _y, w: _w, h: _h });

        // compute select box dimensions
        const scale = getScale(properties.render_dims, properties.image_dims);

        // update crop box view
        overlayLayer.current.drawBoundingBox(
            Math.round(scale.x * _x),
            Math.round(scale.y * _y),
            Math.abs(Math.round(scale.x * _w)),
            Math.abs(Math.round(scale.y * _h))
        );

        // reset crop methods
        setMethods({
            onMouseDown: cropStart,
            onMouseUp: cropEnd,
            onMouseMove: cropBound,
            onMouseOut: cropEnd
        });

        // deselect pointer
        pointer.deselect();
    }

    /**
     * Update canvas offset by cursor position
     * @param e
     * @param properties
     * @param pointer
     */

    const cropBound = (e, properties, pointer) => {
        pointer.set(e);
        // check that mouse start position was selected
        if (!pointer.selected) return;

        e.preventDefault();

        // compute select box dimensions
        const scale = getScale(properties.image_dims, properties.render_dims);
        // (x,y) = top-left corner coordinate
        const _x = Math.min(pointer.x, pointer.selected.x);
        const _y = Math.min(pointer.y, pointer.selected.y);
        const _w = (pointer.x - pointer.selected.x);
        const _h = (pointer.y - pointer.selected.y);

        // update the pointer select box
        // - use magnitude value of width/height
        pointer.setSelectBox({
            x: Math.round(scale.x * _x),
            y: Math.round(scale.y * _y),
            w: Math.abs(Math.round(scale.x * _w)),
            h: Math.abs(Math.round(scale.y * _h))
        });

        // console.log(pointer.selected.x, pointer.selected.y, _w, _h)

        // update crop box boundary
        overlayLayer.current.drawBoundingBox(pointer.selected.x, pointer.selected.y, _w, _h);
    }

    /**
     * Adjust crop box dimensions
     * @param x
     * @param y
     * @param w
     * @param h
     */

    const _cropAdjust = (x, y, w, h) => {
        overlayLayer.current.drawBoundingBox(x, y, w, h);
    }

    /**
     * change top layer opacity
     *
     * @private
     */

    const _updateOpacity = (e) => {
        const { target = {} } = e || {};
        const { value = 100 } = target;
        setOpacity(value);
        // set canvas layer alpha value for opacity
        topLayer === 0 ? renderLayer1.current.alpha(value / 100) : renderLayer2.current.alpha(value / 100);
    }

    /**
     * swap top and bottom layers
     *
     * @private
     */

    const _bringToFront = () => {
        // update top layer properties
        if (topLayer === 0) {
            setTopLayer(1);
            setProperties(properties2);
        }
        else {
            setTopLayer(0);
            setProperties(properties1);
        }

        // reset opacity
        setOpacity(100);
        renderLayer1.current.alpha(1.0);
        renderLayer2.current.alpha(1.0);
    }

    /**
     * Handle canvas mouse down event.
     * - add selected click coordinate to pointer
     * @param e
     * @param properties
     * @param pointer
     * @param topLayer
     * @param properties1
     * @param properties2
     */

    const moveStart = (e, properties, pointer, topLayer, properties1, properties2) => {
        try {
            e.preventDefault();
            pointer.set(e);
            // compute current cursor position
            const pos = getPos(e, properties);
            // determine if pointer coordinate is inside top image
            const inRangeTop =
                pos.x >= properties.render_dims.x
                && pos.x <= properties.render_dims.x + properties.render_dims.w
                && pos.y >= properties.render_dims.y
                && pos.y <= properties.render_dims.y + properties.render_dims.h;

            // if in-range top image, select image for moving
            if (inRangeTop) return pointer.select(e);

            // determine if pointer coordinate is inside bottom image
            // select top render layer and image layer
            const propertiesBottom = topLayer === 0 ? properties2 : properties1;
            const inRangeBottom =
                pos.x >= propertiesBottom.render_dims.x
                && pos.x <= propertiesBottom.render_dims.x + propertiesBottom.render_dims.w
                && pos.y >= propertiesBottom.render_dims.y
                && pos.y <= propertiesBottom.render_dims.y + propertiesBottom.render_dims.h

            // if in-range bottom image, select image for moving
            if (inRangeBottom) {
                // update top layer properties
                if (topLayer === 0) {
                    setTopLayer(1);
                    setProperties(properties2);
                }
                else {
                    setTopLayer(0);
                    setProperties(properties1);
                }
                return pointer.select(e);
            }

        }
        catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    /**
     * Handle canvas mouse move event.
     * - set pointer to position (x, y) of cursor
     *
     * @param e
     * @param properties
     * @param pointer
     * @param topLayer
     */

    const move = (e, properties, pointer, topLayer) => {
        try {
            // set cursor position
            pointer.set(e);

            // check that mouse start position was selected
            if (!pointer.selected) return;

            e.preventDefault();

            // get current mouse position
            const pos = getPos(e, properties);

            // update the pointer selected point
            pointer.setSelect({ x: pos.x, y: pos.y });

            // select top render layer and image layer
            const renderLayer = topLayer === 0 ? renderLayer1.current : renderLayer2.current;
            const imageLayer = topLayer === 0 ? imageLayer1.current : imageLayer2.current;

            // compute distance traveled
            const _x = properties.render_dims.x + pos.x - pointer.selected.x;
            const _y = properties.render_dims.y + pos.y - pointer.selected.y;

            // update image offset coordinate
            renderLayer.draw(imageLayer.canvas(), {
                view: { x: _x, y: _y, w: properties.render_dims.w, h: properties.render_dims.h },
                source: { x: 0, y: 0, w: properties.image_dims.w, h: properties.image_dims.h }
            });
            // update rendered dims
            const renderDims = { w: properties.render_dims.w, h: properties.render_dims.h, x: _x, y: _y }

            // update selected layer properties
            setProperties(prevState => ({ ...prevState, render_dims: renderDims }));

            // update panel states
            topLayer === 0
                ? setProperties1(prevState => ({ ...prevState, render_dims: renderDims }))
                : setProperties2(prevState => ({ ...prevState, render_dims: renderDims }));

        }
        catch (err) {
            console.error(err);
            setStatus('error')
        }
    };

    /**
     * Handle canvas mouse move event.
     * - reset pointer to (0, 0)
     * @param e
     * @param properties
     * @param pointer
     */

    const moveEnd = (e, properties, pointer) => {
        try {
            e.preventDefault();
            pointer.reset();
            pointer.deselect();
        }
        catch (err) {
            console.error(err);
            setStatus('error')
        }
    };

    /**
     * Load comparator images
     * - comparison of images in same scale
     * - use the largest dimension to set the scale
     *
     * @private
     */

    useLayoutEffect(() => {
        if (status === 'empty') {
            load();
        }
        return () => { _mounted.current = true; }

    }, []);


    /**
     * Update methods based on IAT mode
     *
     * @private
     */

    const [methods, setMethods] = React.useState({
        onMouseDown: moveStart,
        onMouseUp: moveEnd,
        onMouseMove: move,
        onMouseOut: moveEnd
    });

    useEffect(() => {
        // load panel methods of IAT mode
        if (mode === 'move') {
            setMethods({
                onMouseDown: moveStart,
                onMouseUp: moveEnd,
                onMouseMove: move,
                onMouseOut: moveEnd
            });
        }
        else if (mode === 'crop') {
            setMethods({
                onMouseDown: cropStart,
                onMouseUp: cropEnd,
                onMouseMove: cropBound,
                onMouseOut: cropEnd
            });
        }
        // update current dom bounds
        setProperties(prevState => ({ ...prevState, bounds: controlLayer.current.bounds() }));
        setProperties1(prevState => ({ ...prevState, bounds: controlLayer.current.bounds() }));
        setProperties2(prevState => ({ ...prevState, bounds: controlLayer.current.bounds() }));
        // reset overlay
        overlayLayer.current.drawBoundingBox(0, 0, 0, 0);
    }, [mode]);

    return <>
        <div className={'h-menu'}>
            <ul>
                <li>
                    <Badge
                        icon={'images'}
                        className={'historic_captures'}
                        label={'Comparator Tool'}
                    />
                </li>
                <li>
                    <Button
                        id={'layer_swap'}
                        icon={'images'}
                        label={`Bring to Front`}
                        title={'Swap top and bottom layers.'}
                        onClick={_bringToFront}
                    />
                </li>
                <li>
                    <Button
                        id={'move_mode'}
                        className={mode === 'move' ? 'success' : 'secondary'}
                        icon={'move'}
                        label={`Move`}
                        title={'Move images to overlap.'}
                        onClick={() => { setMode('move') }}
                    />
                </li>
                <li>
                    <Button
                        id={'crop_mode'}
                        className={mode === 'crop' ? 'success' : 'secondary'}
                        icon={'crop'}
                        label={`Crop`}
                        title={'Crop images to match dimensions.'}
                        onClick={() => { setMode('crop') }}
                    />
                </li>
                <li>
                    <Button
                        id={'layer_reset'}
                        icon={'undo'}
                        label={`Reset`}
                        title={'Reset images to original position and opacity.'}
                        onClick={reset}
                    />
                </li>
                <li>
                    <Button
                        id={'save_crop'}
                        icon={'save'}
                        label={`Save`}
                        title={'Save cropped images'}
                        onClick={save}
                    />
                </li>
                <li>
                    <InputSelector
                        style={{ width: '200px' }}
                        id={'layer_opacity'}
                        name={'layer_opacity'}
                        label={`Opacity ${opacity}%`}
                        type={'range'}
                        value={opacity}
                        min={0}
                        max={100}
                        onChange={_updateOpacity}
                    />
                </li>
                <li className={'push'}>
                    <Badge
                        className={'secondary'}
                        label={`(x: ${pointer.actual.x}, y: ${pointer.actual.y})`}
                    />
                    <Badge
                        label={`Scale: 1:${(1 / (0.0000001 + scale)).toFixed(2)}`}
                    />
                    <Badge
                        className={status === 'loaded' ? 'info' : 'warning'}
                        label={status.toUpperCase()}
                        icon={'image'}
                    />
                </li>
                <li>
                    <Button
                        id={'close_comparator'}
                        icon={'close'}
                        label={`Close`}
                        title={'Close comparator'}
                        onClick={callback}
                    />
                </li>
            </ul>
        </div>
        {
            mode === 'crop' &&
            <CropTool
                callback={crop}
                update={_cropAdjust}
                ptr={pointer}
                props={properties}
            />
        }
        <Canvas
            ref={controlLayer}
            id={`comparator_image_control`}
            className={`layer canvas-layer-control-${mode}`}
            width={comparatorDims.w}
            height={comparatorDims.h}
            onMouseUp={(e) => { methods.onMouseUp(e, properties, pointer) }}
            onMouseDown={(e) => { methods.onMouseDown(e, properties, pointer, topLayer, properties1, properties2) }}
            onMouseMove={(e) => { methods.onMouseMove(e, properties, pointer, topLayer) }}
            onMouseOut={(e) => { methods.onMouseOut(e, properties, pointer) }}
            onKeyDown={() => { }}
            onKeyUp={() => { }}
        />
        <Overlay
            ref={overlayLayer}
            id={`comparator_overlay_layer`}
            className={`layer canvas-layer-overlay`}
            style={{ zIndex: 40 }}
            width={comparatorDims.w}
            height={comparatorDims.h}
        />
        <Canvas
            ref={renderLayer1}
            id={`comparator_image_layer_1`}
            className={`layer canvas-layer-1`}
            style={{ zIndex: topLayer === 0 ? 35 : 30 }}
            width={comparatorDims.w}
            height={comparatorDims.h}
        />
        <Canvas
            ref={renderLayer2}
            id={`comparator_image_layer-2`}
            className={`layer`}
            style={{ zIndex: topLayer === 1 ? 35 : 30 }}
            width={comparatorDims.w}
            height={comparatorDims.h}
        />
        <Canvas
            ref={imageLayer1}
            id={`comparator_render_layer`}
            className={`layer canvas-layer-render hidden`}
            width={iat.options.maxImageWidth}
            height={iat.options.maxImageHeight}
        />
        <Canvas
            ref={imageLayer2}
            id={`comparator_render_layer`}
            className={`layer canvas-layer-render hidden`}
            width={iat.options.maxImageWidth}
            height={iat.options.maxImageHeight}
        />
        <Grid
            ref={gridLayer}
            id={`comparator_base_layer`}
            style={{ backgroundImage: `url(${baseGrid})` }}
            className={`canvas-layer-base`}
            width={comparatorDims.w}
            height={comparatorDims.h}
        />
    </>;
};
