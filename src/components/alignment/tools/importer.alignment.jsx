/*!
 * MLE.Client.Components.Toolkit.Importer
 * File: importer.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import {createRoute, redirect} from '../../../utils/paths.utils.client';
import {useUser} from '../../../providers/user.provider.client';
import {useIat} from "../../../providers/alignment.provider.client";
import InputSelector from "../../selectors/input.selector";
import {UserMessage} from "../../common/message";
import {useRouter} from "../../../providers/router.provider.client";
import {useNav} from "../../../providers/nav.provider.client";
import Accordion from "../../common/accordion";
import Button from "../../common/button";
import {useData} from "../../../providers/data.provider.client";
import Image from "../../common/image";
import {sanitize} from "../../../utils/data.utils.client";
import Table from "../../common/table";

/**
 * Image selector widget. Used to select an image to load into the panel:
 * - from a local file
 * - from the MLP library via the API
 *
 * @public
 * @param {Object} properties
 * @param callback
 */

export const ImporterAlignment = ({ id = null, callback = () => {}, cancel = () => {} }) => {

    const router = useRouter();
    const nav = useNav();
    const user = useUser();
    const iat = useIat();

    const _isMounted = React.useRef(false);
    const [message, setMessage] = React.useState(null);
    const [isEmpty, setIsEmpty] = React.useState(true);
    // const allowedFileTypes = ['tiff'];

    // set selection state
    const [selection, setSelection] = React.useState(null);
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [selectedPanel, setSelectedPanel] = React.useState(null);

    // get name from file
    const selectedFile = selectedImage && selectedImage.hasOwnProperty('filename') ? selectedImage.filename : '';

    /**
     * Load images attached to parent ID
     */

    React.useEffect(() => {
        _isMounted.current = true;
        const _downloader = () => {
            router.get(`/nodes/show/${id}`)
                .then(res => {
                    if (_isMounted.current) {
                        if (!res || res.error) {
                            return res.hasOwnProperty('error')
                                ? setMessage(res.error)
                                : setMessage({msg: 'Error occurred.', type: 'error'});
                        }

                        // get capture data (if available)
                        const {response = {}} = res || {};
                        const {data = []} = response || {};
                        const {files = {}} = data || {};
                        const {modern_images = [], historic_images = []} = files || {};

                        // no capture data is available
                        if (modern_images.length === 0 && historic_images.length === 0) {
                            setMessage({msg: `No images available.`});
                        }
                        else {
                            setIsEmpty(false);
                        }

                        // set image files for selection:
                        setSelection({
                            historic_images: historic_images,
                            modern_images: modern_images
                        });
                    }
                });
        }

        // download selected image to IAT canvas
        _downloader();

        // if (selectedFile) {
        //     setMessage({ msg: `Image ${selectedFile} ready to load.`, type: 'info' });
        // }
        return () => {
            _isMounted.current = false;
        };
    }, [
        user,
        id,
        router,
        nav,
        setSelection,
        callback,
        setMessage,
        selectedFile
    ]);

    // submit selection for canvas loading
    const _handleSubmit = () => {
        const {file_type = '', id = ''} = selectedImage || {};
        const params = selectedPanel === 'panel1' ? {file1: id, type1: file_type} : {file2: id, type2: file_type};

        console.log(params)

        // load image in Explorer Toolkit
        // - if in alignment mode, load directly to canvas
        // - otherwise, redirect with query params
        window.location.pathname === '/toolkit'
            ? iat.setInputParams(params)
            : redirect(createRoute('/toolkit', params));

        callback();
    };

    // update selected image file for canvas loading
    const _handleSelectImage = (file) => {
        setSelectedImage(file);
    };

    // update selected panel to load image
    const _handleSelectPanel = (e) => {
        const {target = {}} = e || {};
        const {value = ''} = target;
        // notify if image is loaded in selected panel
        if (value === 'panel1' && !!iat.img1) setMessage(
            {msg: 'Warning: An image is currently loaded in the Left Panel.', type: 'warning'});
        if (value === 'panel2' && !!iat.img2) setMessage(
            {msg: 'Warning: An image is currently loaded in the Right Panel.', type: 'warning'});
        setSelectedPanel(value);
    }

    return <>
        {
            !user && <p>Note that a low-resolution version of the selected image will be loaded.</p>
        }
        <InputSelector
            id={'panel-selector'}
            type={'select'}
            label={isEmpty ? 'No images available to load into panel' : `Select the target panel for image`}
            value={selectedPanel}
            onChange={_handleSelectPanel}
            disabled={isEmpty}
            options={[
                {value: 'panel1', label: 'Load selected image into Left Panel'},
                {value: 'panel2', label: 'Load selected image into Right Panel'}
            ]}
        />
        {
            selectedPanel && message &&
            <UserMessage onClose={() => {
                setMessage(null)
            }} closeable={true} message={message}/>
        }
        {
            !isEmpty ?
                <Accordion label={'Select Capture Image'} type={'image'} open={true}>
                    {
                        Object.keys(selection || {}).map(imageType => {
                            return <ImagePicker
                                key={imageType}
                                files={selection[imageType]}
                                onClick={_handleSelectImage}
                                onDblClick={_handleSubmit}
                            />
                        })
                    }
                </Accordion>
                : <p>No Images Available</p>
        }
        {
            <fieldset className={'submit h-menu'}>
                <ul>
                    <li key={'submit_selector'}>
                        <Button
                            className={!selectedImage || !selectedPanel ? '' : 'success'}
                            disabled={!selectedImage || !selectedPanel}
                            icon={'download'}
                            label={!selectedImage || !selectedPanel
                                ? 'Select Image and Panel' : 'Load Image in Toolkit'}
                            onClick={_handleSubmit}
                        />
                    </li>
                    <li key={'cancel_selector'}>
                        <Button
                            icon={'cancel'}
                            label={'Cancel'}
                            onClick={cancel}
                        />
                    </li>
                </ul>
            </fieldset>
        }
    </>;
};
/**
 * Image selector widget.
 *
 * @public
 * @param {Array} files
 * @param {Function} onClick
 * @param {Function} onDblClick
 */

export const ImagePicker = ({
                                files,
                                onClick = () => {},
                                onDblClick = () => {},
                            }) => {

    // prepare capture images columns
    const cols = [
        {name: 'select', label: 'Select'},
        {name: 'thumbnail', label: 'Image', class: 'image-thumbnail'},
        {name: 'image_state', label: 'State'},
        {name: 'width', label: 'Width'},
        {name: 'height', label: 'Height'},
        {name: 'file_size', label: 'File Size'},
    ];

    const api = useData();

    // set image selection state
    const [selected, setSelected] = React.useState(null);

    // prepare capture image data rows
    const rows = files.map(fileData => {
        const {file = {}, metadata = {}, url = {}, filename = ''} = fileData || {};
        const {id = {}} = file || {};
        const {image_states = []} = api.options || {};
        // select image state label for value (if available)
        const imageState = image_states.find(opt => opt.value === metadata.image_state);
        const rows = {
            select: <div
                className={selected === id ? 'selected' : ''}
                style={{textAlign: 'center', height: '50px', width: '50px', margin: 'auto'}}>
                <InputSelector
                name={'selectedImage'}
                type={'checkbox'}
                value={id === selected}
                onChange={() => {
                    setSelected(id)
                    onClick(file);
                }}
                /></div>,
            thumbnail: <div style={{textAlign: 'center', width: '150px', margin: 'auto'}}>
                <Image
                    url={url}
                    scale={'thumb'}
                    title={`Select ${filename || ''}.`}
                    caption={filename}
                    onClick={() => {
                        setSelected(id)
                        onClick(file);
                    }}
                    onDoubleClick={() => {
                        onDblClick(file)
                    }}
                />
            </div>,
            image_state: imageState && imageState.hasOwnProperty('label') ? imageState.label : 'n/a',
            width: sanitize(metadata.x_dim, 'imgsize'),
            height: sanitize(metadata.y_dim, 'imgsize'),
            file_size: sanitize(file.file_size, 'filesize'),
        };
        // include file size in metadata
        metadata.file_size = file.file_size;

        return rows;
    });

    return <>
        {
            rows.length > 0 && <Table rows={rows} cols={cols} className={'files'}/>
        }
    </>;
};