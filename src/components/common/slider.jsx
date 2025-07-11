/*!
 * MLE.Client.Components.Common.Slider
 * File: slider.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Sliding view of overlapping images
 *
 * ---------
 * Revisions
 * - 14-07-2023   Redo of slider canvases.
 * - 03-08-2024   Update slider to include image swap controls; centred view.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { schema } from '../../schema';
import Loading from './loading';
import { UserMessage } from './message';
import { scaleToFit } from '../alignment/tools/scaler.alignment';
import InputSelector from "../selectors/input.selector";
import Button from './button';
import Canvas from "../alignment/canvas/default.canvas.alignment";
import styles from '../styles/slider.module.css';
import { useWindowSize } from "../../utils/events.utils.client";
import {usePointer} from "../alignment/tools/pointer.alignment";
import MagnifierTool from '../alignment/canvas/magnifier.canvas.alignment';

/**
 * Image slider component.
 *
 * @public
 * @return
 */

const Slider = ({ images = [] }) => {

    // default canvas sizes and magnification factor
    const DEFAULT_CANVAS_WIDTH = 900;
    const DEFAULT_CANVAS_HEIGHT = 900;
    const MAGNIFICATION = 2.0;

    // window dimensions
    const [winWidth, winHeight] = useWindowSize();

    // input image data
    const [image1, image2] = images || [];

    // image data layers
    const renderLayer1 = useRef(null);
    const renderLayer2 = useRef(null);
    const imageLayer1 = useRef(null);
    const imageLayer2 = useRef(null);
    const defaultControlLayer = useRef();
    const sliderControlLayer = useRef();
    const magControlLayer = useRef(null);
    const magnifiedImage1 = useRef(null);
    const magnifiedImage2 = useRef(null);
    const magnifierLayer = useRef(null);

    // create reference to panel resizer
    let sliding = false;
    let slideWidth = 0;
    let slideInit = 0;

    const [canvasWidth, setCanvasWidth] = React.useState(DEFAULT_CANVAS_WIDTH);
    const [canvasHeight, setCanvasHeight] = React.useState(DEFAULT_CANVAS_HEIGHT);

    const [status1, setStatus1] = React.useState('empty');
    const [status2, setStatus2] = React.useState('empty');
    const [message, setMessage] = React.useState('empty');

    const [viewWidth, setViewWidth] = React.useState(0);
    const [viewDims, setViewDims] = React.useState(null);
    const [viewMode, setViewMode] = React.useState(null);
    const [toggle, setToggle] = React.useState(false);
    const [properties, setProperties] = React.useState({
        image_dims: {w: DEFAULT_CANVAS_WIDTH, h: DEFAULT_CANVAS_HEIGHT}, 
        render_dims: {w: DEFAULT_CANVAS_WIDTH, h: DEFAULT_CANVAS_HEIGHT},
        base_dims: {w: DEFAULT_CANVAS_WIDTH, h: DEFAULT_CANVAS_HEIGHT}, 
        magnified_dims: {w: MAGNIFICATION*DEFAULT_CANVAS_WIDTH, h: MAGNIFICATION*DEFAULT_CANVAS_HEIGHT},
        bounds: {w: DEFAULT_CANVAS_WIDTH, h: DEFAULT_CANVAS_HEIGHT}
    })

    // Image labels
    const label1 = image1 && image1.hasOwnProperty('label') ? image1.label : 'Historic Image';
    const label2 = image2 && image2.hasOwnProperty('label') ? image2.label : 'Modern Image';

    // top layer opacity state
    const [opacity, setOpacity] = useState(100);

    // initialize canvas pointers
    const pointer = usePointer(properties);

    /**
     * Render image 1 data on canvas layer 1
     *
     * @private
     */

    const _drawImage1 = () => {

        if (!imageLayer1.current || !imageLayer2.current) return;

        // compute scaled dimensions for image 1 to fit view canvas
        const viewDims1 = scaleToFit(
            imageLayer1.current.width,
            imageLayer1.current.height,
            DEFAULT_CANVAS_WIDTH,
            DEFAULT_CANVAS_HEIGHT,
        );

        // compute scaled dimensions for image 2 to fit view canvas
        const viewDims2 = scaleToFit(
            imageLayer2.current.width,
            imageLayer2.current.height,
            DEFAULT_CANVAS_WIDTH,
            DEFAULT_CANVAS_HEIGHT,
        );

        // Render image to canvas by view mode
        if (viewMode === 'slider') {
            // set canvas width to default;
            setCanvasWidth(DEFAULT_CANVAS_WIDTH);
            renderLayer1.current.setWidth(DEFAULT_CANVAS_WIDTH);
            // compute image x offset
            const _viewOffset1 = (DEFAULT_CANVAS_WIDTH - viewDims1.w) / 2;
            renderLayer1.current.draw(imageLayer1.current, {
                view: { x: _viewOffset1, y: 0, w: toggle ? viewDims1.w / 2 : viewDims1.w, h: viewDims1.h },
                source: { x: 0, y: 0, w: toggle ? imageLayer1.current.width / 2 : imageLayer1.current.width, h: imageLayer1.current.height }
            });
            // draw magnified image to canvas
            magnifiedImage1.current.setWidth(MAGNIFICATION * viewDims1.w);
            magnifiedImage1.current.setHeight(MAGNIFICATION * viewDims1.h);
            magnifiedImage1.current.draw(imageLayer1.current, {
                view: { x: 0, y: 0, w: MAGNIFICATION * viewDims1.w, h: MAGNIFICATION * viewDims1.h },
                source: { x: 0, y: 0, w: imageLayer1.current.width, h: imageLayer1.current.height  }
            });
            // update properties
            setProperties(prevState => ({...prevState,
                bounds: renderLayer1.current.bounds(),
                base_dims: { w: DEFAULT_CANVAS_WIDTH, h: DEFAULT_CANVAS_HEIGHT },
                render_dims: { x: _viewOffset1, y: 0, w: viewDims1.w, h: viewDims1.h },
                magnified_dims: { x: 0, y: 0, w: MAGNIFICATION * viewDims1.w, h: MAGNIFICATION * viewDims1.h }
            }));
            
        }
        else if (viewMode === 'double') {
            // set canvas width to double
            const _combinedWidth = viewDims1.w + viewDims2.w;
            setCanvasWidth(_combinedWidth);
            // draw image to render canvas
            renderLayer1.current.setWidth(_combinedWidth);
            renderLayer1.current.draw(imageLayer1.current, {
                view: { x: toggle ? 0 : viewDims1.w, y: 0, w: viewDims1.w, h: viewDims1.h },
                source: { x: 0, y: 0, w: imageLayer1.current.width, h: imageLayer1.current.height }
            }, false);
            // draw magnified image to canvas
            magnifiedImage1.current.setWidth(MAGNIFICATION * _combinedWidth);
            magnifiedImage1.current.setHeight(MAGNIFICATION * viewDims1.h);
            magnifiedImage1.current.draw(imageLayer1.current, {
                view: { x: toggle ? 0 : MAGNIFICATION * viewDims2.w, y: 0, w: MAGNIFICATION * viewDims1.w, h: MAGNIFICATION * viewDims1.h },
                source: { x: 0, y: 0, w: imageLayer1.current.width, h: imageLayer1.current.height  }
            }, false);
            // update properties
            setProperties(prevState => ({...prevState,
                bounds: renderLayer1.current.bounds(),
                base_dims: { w: _combinedWidth, h: viewDims1.h },
                render_dims: { x: 0, y: 0, w: _combinedWidth, h: viewDims1.h },
                magnified_dims: { x: 0, y: 0, w: MAGNIFICATION * _combinedWidth,  h: MAGNIFICATION * viewDims1.h }
            }));
        }
        else {
            // set canvas width to default
            setCanvasWidth(DEFAULT_CANVAS_WIDTH);
            renderLayer1.current.setWidth(DEFAULT_CANVAS_WIDTH);
            // compute image x offset
            const _viewOffset1 = (DEFAULT_CANVAS_WIDTH - viewDims1.w) / 2;
            // draw image to render canvas
            renderLayer1.current.draw(imageLayer1.current, {
                view: { x: _viewOffset1, y: 0, w: viewDims1.w, h: viewDims1.h },
                source: { x: 0, y: 0, w: imageLayer1.current.width, h: imageLayer1.current.height }
            });
            // draw magnified image to canvas
            magnifiedImage1.current.setWidth(MAGNIFICATION * viewDims1.w);
            magnifiedImage1.current.setHeight(MAGNIFICATION * viewDims1.h);
            magnifiedImage1.current.draw(imageLayer1.current, {
                view: { x: 0, y: 0, w: MAGNIFICATION * viewDims1.w, h: MAGNIFICATION * viewDims1.h },
                source: { x: 0, y: 0, w: imageLayer1.current.width, h: imageLayer1.current.height  }
            });
            // update properties
            setProperties(prevState => ({...prevState,
                bounds: renderLayer1.current.bounds(),
                base_dims: { w: DEFAULT_CANVAS_WIDTH, h: DEFAULT_CANVAS_HEIGHT },
                render_dims: { x: _viewOffset1, y: 0, w: viewDims1.w, h: viewDims1.h },
                magnified_dims: { x: 0, y: 0, w: MAGNIFICATION * viewDims1.w, h: MAGNIFICATION * viewDims1.h }
            }));
        }
        

        // reset canvas height
        setCanvasHeight(viewDims1.h);

        // set initial view dims
        if (toggle) {
            setViewWidth(viewMode === 'slider' ? viewDims1.w / 2 : viewDims1.w);
            setViewDims(viewDims1);
        }
    }

    /**
     * Render image 2 data on canvas layer 2
     *
     * @private
     */

    const _drawImage2 = () => {

        if (!imageLayer2.current || !imageLayer1.current) return;

        // compute scaled dimensions for image 1 to fit view canvas
        const viewDims1 = scaleToFit(
            imageLayer1.current.width,
            imageLayer1.current.height,
            DEFAULT_CANVAS_WIDTH,
            DEFAULT_CANVAS_HEIGHT,
        );

        // compute scaled dimensions for image 2 to fit view canvas
        const viewDims2 = scaleToFit(
            imageLayer2.current.width,
            imageLayer2.current.height,
            DEFAULT_CANVAS_WIDTH,
            DEFAULT_CANVAS_HEIGHT,
        );

        // Render image to canvas based on view mode
        if (viewMode === 'slider') {
            // set canvas width to default
            setCanvasWidth(DEFAULT_CANVAS_WIDTH);
            renderLayer2.current.setWidth(DEFAULT_CANVAS_WIDTH);
            // compute image x offset
            const _viewOffset2 = (DEFAULT_CANVAS_WIDTH - viewDims1.w) / 2;
            // render image
            renderLayer2.current.draw(imageLayer2.current, {
                view: { x: _viewOffset2, y: 0, w: !toggle ? viewDims2.w / 2 : viewDims2.w, h: viewDims2.h },
                source: { x: 0, y: 0, w: !toggle ? imageLayer2.current.width / 2 : imageLayer2.current.width, h: imageLayer2.current.height }
            });
            // draw magnified image to canvas
            magnifiedImage2.current.setWidth(MAGNIFICATION * viewDims2.w);
            magnifiedImage2.current.setHeight(MAGNIFICATION * viewDims2.h);
            magnifiedImage2.current.draw(imageLayer2.current, {
                view: { x: 0, y: 0, w: MAGNIFICATION * viewDims2.w, h: MAGNIFICATION * viewDims2.h },
                source: { x: 0, y: 0, w: imageLayer2.current.width, h: imageLayer2.current.height  }
            });
        }
        else if (viewMode === 'double') {
            // clear canvas 2 (image 2)
            renderLayer2.current.clear();
            // draw image 2 to canvas 1 with offset
            renderLayer1.current.draw(imageLayer2.current, {
                view: { x: toggle ? viewDims1.w : 0, y: 0, w: viewDims2.w, h: viewDims2.h },
                source: { x: 0, y: 0, w: imageLayer2.current.width, h: imageLayer2.current.height }
            }, false);
            // clear magnified canvas 2 (image 2)
            magnifiedImage2.current.clear();
            // draw magnified image 2 to canvas 1
            magnifiedImage1.current.draw(imageLayer2.current, {
                view: { x: toggle ? MAGNIFICATION * viewDims1.w : 0, y: 0, w: MAGNIFICATION * viewDims2.w, h: MAGNIFICATION * viewDims2.h },
                source: { x: 0, y: 0, w: imageLayer2.current.width, h: imageLayer2.current.height  }
            }, false);
        }
        else {
            // set canvas width to default
            setCanvasWidth(DEFAULT_CANVAS_WIDTH);
            renderLayer2.current.setWidth(DEFAULT_CANVAS_WIDTH);
            // compute image x offset
            const _viewOffset2 = (DEFAULT_CANVAS_WIDTH - viewDims1.w) / 2;
            renderLayer2.current.draw(imageLayer2.current, {
                view: { x: _viewOffset2, y: 0, w: viewDims2.w, h: viewDims2.h },
                source: { x: 0, y: 0, w: imageLayer2.current.width, h: imageLayer2.current.height }
            });
            // draw magnified image to canvas
            magnifiedImage2.current.setWidth(MAGNIFICATION * viewDims2.w);
            magnifiedImage2.current.setHeight(MAGNIFICATION * viewDims2.h);
            magnifiedImage2.current.draw(imageLayer2.current, {
                view: { x: 0, y: 0, w: MAGNIFICATION * viewDims2.w, h: MAGNIFICATION * viewDims2.h },
                source: { x: 0, y: 0, w: imageLayer2.current.width, h: imageLayer2.current.height  }
            });
            // update properties
            setProperties(prevState => ({...prevState,
                bounds: renderLayer2.current.bounds(),
                base_dims: { w: DEFAULT_CANVAS_WIDTH, h: DEFAULT_CANVAS_HEIGHT },
                render_dims: { x: _viewOffset2, y: 0, w: viewDims2.w, h: viewDims2.h },
                magnified_dims: { x: 0, y: 0, w: MAGNIFICATION * viewDims2.w, h: MAGNIFICATION * viewDims2.h }
            }));
        }

        // reset canvas height
        setCanvasHeight(viewDims2.h);

        // set initial view dims
        if (!toggle) {
            setViewWidth(viewMode === 'slider' ? viewDims2.w / 2 : viewDims2.w);
            setViewDims(viewDims2);
        }
    }


    /**
     * Load image data in comparator panel
     *
     * @private
     */

    const _load = () => {

        // status = image loading has started
        setStatus1('loading');
        setStatus2('loading');

        // reset canvas size
        setCanvasWidth(DEFAULT_CANVAS_WIDTH);
        setCanvasHeight(DEFAULT_CANVAS_HEIGHT);

        // set data urls for images
        const url1 = image1 && image1.hasOwnProperty('url') ? image1.url.medium : image1;
        const url2 = image2 && image2.hasOwnProperty('url') ? image2.url.medium : image2;
        // set view image sources
        imageLayer1.current.src = url1;
        imageLayer2.current.src = url2;

        // load image 1
        imageLayer1.current.onload = function () {
            // load image data to canvas layer
            _drawImage1();
            // update load status
            setStatus1('loaded');
        };
        imageLayer1.current.onerror = () => {
            setMessage({ msg: 'Error: Image could not be loaded.', type: 'error' });
            imageLayer1.current.src = schema.errors.image.fallbackSrc;
        };
        
        // load image 2
        imageLayer2.current.onload = function () {
            // load image data to canvas layer
            _drawImage2();
            // update load status
            setStatus2('loaded');
        };
        imageLayer2.current.onerror = () => {
            setMessage({ msg: 'Error: Image could not be loaded.', type: 'error' });
            imageLayer2.current.src = schema.errors.image.fallbackSrc;
        };

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
        toggle ? renderLayer1.current.alpha(value / 100) : renderLayer2.current.alpha(value / 100);
    }

    /**
     * reset opacity on both layers
     *
     * @private
     */

    const _resetOpacity = () => {
        setOpacity(100);
        renderLayer1.current.alpha(100);
        renderLayer2.current.alpha(100);
    }

    /**
     * toggle image magnifier tool
     *
     * @private
     */

    const _toggleMagnifier = () => {
        pointer.magnify ? pointer.magnifyOff() : pointer.magnifyOn();
    }

    /**
     * Load comparator images
     * - comparison of images in same scale
     * - use the largest dimension to set the scale
     *
     * @private
     */

    useLayoutEffect(() => {
        if (status1 === 'empty' || status2 === 'empty') _load();
    }, []);

     /**
     * Reload images on image source and window size change.
     *
     * @private
     */

    useLayoutEffect(() => {
        _load();
    }, [winWidth, winHeight, images]);


    /**
     * Redraw image to canvas.
     *
     * @private
     */

    useLayoutEffect(() => {
        _drawImage1();
        _drawImage2();
        _resetOpacity();
    }, [viewMode, toggle]);

    /**
     * Apply magnification to image.
     *
     * @private
     */

    useEffect(() => {

        // compare current with previously set pointer bounds
        const _compareBounds = (bounds1, bounds2) => {
            return bounds1.top === bounds2.top 
            && bounds1.left === bounds2.left 
            && bounds1.width === bounds2.width 
            && bounds1.height === bounds2.height;
        }
        
        // get current canvas bounds
        const bounds = toggle || viewMode === 'double' ? renderLayer1.current.bounds() : renderLayer2.current.bounds(); 

        // apply magnification if enabled
        if (pointer.magnify) {    
            // get current magnified image
            const _magnifiedImage = toggle || viewMode === 'double' ? magnifiedImage1.current.canvas() : magnifiedImage2.current.canvas();
            
            // check pointer bounds to detect canvas translation (e.g., scrolling)
            if(_compareBounds(bounds, properties.bounds)) {
                magnifierLayer.current.magnify(_magnifiedImage, {pointer, properties});
            }
            else {
                // update pointer bounds (update properties state)
                setProperties(prevState => ({...prevState, bounds: bounds }));
                magnifierLayer.current.magnify(_magnifiedImage, {pointer, properties: {...properties, bounds: bounds}});
            }
        }
        else {
            magnifierLayer.current.clear();
        }
    }, [pointer.x, pointer.y, pointer.magnify, viewMode]);

    /* Initialize panel resize */
    function _resizeStart(e) {
        /* if slider is no longer engaged, exit this function: */
        if (sliding) return false;
        sliding = true;
        slideInit = e.pageX;
        slideWidth = viewWidth;
    }

    /* Position the slider and resize panel */
    function _resizeEnd() {
        /* if slider is no longer engaged, exit this function: */
        if (!sliding) return false;
        sliding = false;
        setViewWidth(slideWidth);
    }

    /* Position the slider and resize panel */
    function _resize(e) {


        /* if slider is no longer engaged, exit this function: */
        if (!sliding) return false;

        // compute adjusted widths
        const _viewWidth = viewWidth - Math.round(slideInit - e.pageX);
        const _imageFullWidth = toggle ? imageLayer1.current.width : imageLayer2.current.width;
        const _imageWidth = Math.round(_viewWidth * (_imageFullWidth / viewDims.w));
        const _viewOffset = (canvasWidth - viewDims.w) / 2;

        // load data into canvas layer
        // - initially show half of top layer image
        toggle ? 
        renderLayer1.current.draw(imageLayer1.current, {
            view: { x: _viewOffset, y: 0, w: _viewWidth, h: viewDims.h },
            source: { x: 0, y: 0, w: _imageWidth, h: imageLayer1.current.height }
        }) 
        :
        renderLayer2.current.draw(imageLayer2.current, {
            view: { x: _viewOffset, y: 0, w: _viewWidth, h: viewDims.h },
            source: { x: 0, y: 0, w: _imageWidth, h: imageLayer2.current.height }
        });

        // set slide width
        slideWidth = _viewWidth;

    }

    /* Show magnifier viewer at pointer position */
    function _setPointer(e) {    
        e.preventDefault();
        pointer.set(e, properties);
    }

    return <>
        <div className={styles.slider}>
            {(status1 !== 'loaded' || status2 !== 'loaded') && <Loading className={'centered'} overlay={true} />}
            {message && <UserMessage message={message} />}
            <div className={styles.container} style={{ height: `${canvasHeight}px`, width: `${canvasWidth}px`, margin: 'auto' }}>
                {
                pointer.magnify && <Canvas
                    ref={magControlLayer}
                    id={`image_control_magnifier`}
                    style={{zIndex: 55, cursor: 'crosshair'}}
                    className={styles.overlay}
                    width={canvasWidth}
                    height={DEFAULT_CANVAS_HEIGHT}
                    onMouseMove={_setPointer}
                    /> 
                }
                {
                viewMode === 'slider' && <Canvas
                    ref={sliderControlLayer}
                    style={{zIndex: 50, cursor: 'col-resize'}}
                    id={`image_control_slider`}
                    className={styles.overlay}
                    width={canvasWidth}
                    height={DEFAULT_CANVAS_HEIGHT}
                    onMouseDown={_resizeStart}
                    onMouseUp={_resizeEnd}
                    onMouseMove={_resize}
                    onTouchStart={_resizeStart}
                    onTouchEnd={_resizeEnd}
                    onTouchMove={_resize}
                    /> 
                }
                <Canvas
                    ref={defaultControlLayer}
                    id={`default_control`}
                    style={{zIndex: 35, cursor: 'default'}}
                    className={styles.overlay}
                    width={canvasWidth}
                    height={DEFAULT_CANVAS_HEIGHT}
                    onMouseMove={_setPointer}
                    /> 
                <MagnifierTool
                    style={{'zIndex': 25}}
                    ref={magnifierLayer}
                    id={`magnifier_layer`}
                    className={`layer`}
                    width={canvasWidth}
                    height={DEFAULT_CANVAS_HEIGHT}
                />
                <Canvas
                    style={{'zIndex': toggle ? 20 : 10}}
                    className={styles.image1}
                    ref={renderLayer1}
                    id={`slider_image_layer_1`}
                    width={DEFAULT_CANVAS_WIDTH}
                    height={DEFAULT_CANVAS_HEIGHT}
                />
                <Canvas
                    style={{'zIndex': toggle ? 10 : 20}}
                    className={styles.image2}
                    ref={renderLayer2}
                    id={`slider_image_layer_2`}
                    width={DEFAULT_CANVAS_WIDTH}
                    height={DEFAULT_CANVAS_HEIGHT}
                />
                <Canvas
                    style={{ 'display': 'none' }}
                    ref={magnifiedImage1}
                    id={`slider_magnified_image_layer_1`}
                    width={DEFAULT_CANVAS_WIDTH}
                    height={DEFAULT_CANVAS_HEIGHT}
                />
                <Canvas
                    style={{ 'display': 'none' }}
                    ref={magnifiedImage2}
                    id={`slider_magnified_image_layer_2`}
                    width={DEFAULT_CANVAS_WIDTH}
                    height={DEFAULT_CANVAS_HEIGHT}
                />
                <img
                    style={{ 'display': 'none' }}
                    ref={imageLayer1}
                    crossOrigin={'anonymous'}
                    src={schema.errors.image.fallbackSrc}
                    alt={label1}
                />
                <img
                    style={{ 'display': 'none' }}
                    ref={imageLayer2}
                    crossOrigin={'anonymous'}
                    src={schema.errors.image.fallbackSrc}
                    alt={label2}
                />
            </div>
            <div className={'slide-menu h-menu vcentered'}>
                <ul>
                <li><Button
                        title={'View Image'}
                        label={'Single View'}
                        className={`capture-button ${!viewMode && 'active'}`}
                        icon={'image'}
                        onClick={() => {setViewMode(null)}}
                    /></li>
                    <li><Button
                        title={'Compare Images side-by-side.'}
                        label={'Double View'}
                        className={`capture-button ${viewMode === 'double' && 'active'}`}
                        icon={'images'}
                        onClick={() => {setViewMode('double')}}
                    /></li>
                    <li><Button
                        title={'Compare Images using Slider'}
                        label={'Slider View'}
                        className={`capture-button ${viewMode === 'slider' && 'active'}`}
                        icon={'slider'}
                        onClick={() => {setViewMode('slider')}}
                    /></li>
                    <li><Button
                        icon={'sync'}
                        className={`capture-button`}
                        onClick={() => setToggle(!toggle)}
                        label={'Swap Images'}
                    /></li>
                    <li><Button
                        icon={'magnify'}
                        className={`capture-button ${pointer.magnify && 'active'}`}
                        onClick={_toggleMagnifier}
                        label={'Magnify'}
                    /></li>
                    <li className={'push'}>
                        <InputSelector
                            disabled={viewMode==='double'}
                            style={{ width: '200px' }}
                            id={'layer_opacity'}
                            name={'layer_opacity'}
                            label={`Opacity ${opacity}%`}
                            type={'range'}
                            value={opacity}
                            min={0}
                            max={100}
                            onChange={_updateOpacity} />
                    </li>
                </ul>
            </div>

        </div>
    </>;

};

export default Slider;