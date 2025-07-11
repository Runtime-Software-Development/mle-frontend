/*!
 * MLE.Client.Components.Toolkit.Uploader
 * File: uploader.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Toolkit uploader tool to upload images from the panel canvas to the MLP Library.
 *
 * ---------
 * Revisions
 * - 09-07-2023   Major upgrade to Toolkit incl. UI and workflow improvements and OpenCV integration
 * - 16-07-2023   Include image format selection for upload
 */

import React, {useEffect, useRef} from 'react';
import Editor from '../../editors/default.editor';
import {genSchema} from '../../../services/schema.services.client';
import {createNodeRoute} from '../../../utils/paths.utils.client';
import { useUser } from '../../../providers/user.provider.client';
import {useIat} from "../../../providers/alignment.provider.client";
import InputSelector from "../../selectors/input.selector";
import {UserMessage} from "../../common/message";
import Canvas from "../canvas/default.canvas.alignment";

/**
 * Upload images from IAT canvas to MLP library.
 *
 * @public
 */

export const UploaderAlignment = ({ id=null, model=null, callback = () => {}, cancel = () => {} }) => {

    const user = useUser();
    const iat = useIat();

    // define image canvas layers to store image data
    const imageLayer1 = useRef(null);
    const imageLayer2 = useRef(null);

    const [message, setMessage] = React.useState(null);
    const [selectedPanelID, setSelectedPanelID] = React.useState(null);
    const [imageData, setImageData] = React.useState(null);
    const [format, setFormat] = React.useState(null);

    // get new file type
    const fileType = String(model) === 'historic_captures' ? 'historic_images' : 'modern_images';

    /**
     * Load uploader images
     *
     * @private
     */

    useEffect(()=>{
        // load data into image layers
        imageLayer1.current.load(iat.panel1.image);
        imageLayer2.current.load(iat.panel2.image);
    }, []);

    // Handler for file format selection.
    const _handleFormatSelect = (e) => {
        const { target = {} } = e || {};
        const { value = '' } = target;
        const {formats=[], blobQuality} = iat.options || {};
        const opt = formats.find(opt => value === opt.value);
        setFormat({
            type: value,
            ext: opt ? opt.label : null,
            quality: blobQuality
        });
    };

    // update selected panel to load image
    const _handleCanvasToBlob = (blob) => {
        setImageData(blob);
        setMessage({msg: `Image ready for upload!`, type: 'success'});
    }

    // update selected panel to load image
    const _handleSelectPanel = (e) => {
        const { target={} } = e || {};
        const { value='' } = target;
        setSelectedPanelID(value);
        if (!value) return;
        const {label} = iat.hasOwnProperty(value) && iat[value].properties;
        // image not loaded into panel
        if (!iat[value].image) return setMessage({msg: `No image loaded in ${label}.`, type: 'warning'});
        // image format not selected
        if (!format) return setMessage({msg: `Select the image format.`, type: 'warning'});
        // create blob from selected panel canvas
        setMessage({msg: `Buffering image data from ${label}...`, type: 'info'});
        value === 'panel1'
            ? imageLayer1.current.blob(null, format.type, format.quality, _handleCanvasToBlob)
            : imageLayer2.current.blob(null, format.type, format.quality, _handleCanvasToBlob)

    }

    return <>
        <InputSelector
            label={'Save the file as'}
            type={'select'}
            options={iat.options.formats}
            value={format && format.type}
            onChange={_handleFormatSelect}
        />
        <InputSelector
            disabled={!format}
            id={'panel-selector'}
            type={'select'}
            label={'Select the Image Toolkit Panel'}
            value={selectedPanelID}
            onChange={_handleSelectPanel}
            options={[
                {value:'panel1', label:'Upload image from Left Panel'},
                {value:'panel2', label:'Upload image from Right Panel'}
            ]}
        />
        {
            !user && <UserMessage closeable={false} message={{msg: 'Upload is restricted to admin users.'}} />
        }
        {
            selectedPanelID && message && <UserMessage closeable={false} message={message} />
        }
        {
            user && imageData && selectedPanelID && iat.hasOwnProperty(selectedPanelID) &&
            <Editor
                model={fileType}
                view={'new'}
                schema={genSchema({
                    view: 'upload',
                    model: fileType,
                    user: user
                })}
                route={createNodeRoute(fileType, 'new', id)}
                onCancel={cancel}
                files={[
                    {
                        name: fileType,
                        value: imageData,
                        filename: iat[selectedPanelID].properties.filename
                    }
                ]}
                callback={callback}
            />
        }
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
        </>
};



