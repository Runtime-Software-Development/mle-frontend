/*!
 * MLE.Client.Components.Toolkit.Opener
 * File: opener.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Loads files into the Image Toolkit from MLP library or local disk. User selects the image and panel.
 *
 * ---------
 * Revisions
 * - 09-07-2023   Updated to show tooltip prompt for loading images from library
 * - 14-07-2023   Fixed file drag-and-drop to include dropped image files
 *
 */

import React from 'react';
import Accordion from '../../common/accordion';
import Button from '../../common/button';
import InputSelector from '../../selectors/input.selector';
import { UserMessage } from '../../common/message';
import {useIat} from "../../../providers/alignment.provider.client";
import {initPanel} from "../panel/init.panel.alignment";
import {useDialog} from "../../../providers/dialog.provider.client";
import {useNav} from "../../../providers/nav.provider.client";
import {getTooltip} from "../../content/alignment.help";
import {useUser} from "../../../providers/user.provider.client";

/**
 * Image selector widget. Used to select a local image file to load into the panel.
 *
 * @public
 * @param {Object} properties
 * @param {Function} callback
 * @param {Function} cancel
 */

export const ImageOpener = ({id=null, callback = ()=>{}, cancel=()=>{}}) => {

    const iat = useIat();
    const dialog = useDialog();
    const nav = useNav();
    const user = useUser();
    const panel = iat && id ? iat[id] : {};

    const [selectedImage, setSelectedImage] = React.useState(null);
    const [message, setMessage] = React.useState(null);
    const allowedFileTypes = Object.keys(iat.options.formats || {}).map(key => {
        return iat.options.formats[key].value;
    });

    // get name from file
    const selectedFile = selectedImage && selectedImage.hasOwnProperty('filename') ? selectedImage.filename : '';
    // submit selection for canvas loading
    const _handleSubmit = () => {
        callback(initPanel(panel.properties.id, panel.properties.label, selectedImage));
    };

    // update selected image file for canvas loading
    const _handleFile = (file) => {
        try {
            // get metadata (for capture images)
            const {files_id = {}} = selectedImage || {};
            // Handle TIFF images
            if (file.hasOwnProperty('type') || allowedFileTypes.includes(file.type)) {
                // set canvas properties
                setSelectedImage({
                    files_id: files_id,
                    file: {
                        file_type: file.type,
                        file_size: file.size,
                    },
                    filename: file.name,
                    fileData: file,
                });
            } else {
                setMessage({msg: `Image format is not supported.`, type: 'error'});
            }
        }
        catch (e) {
            console.error(e);
            setMessage({msg: `Unknown error. Image cannot be uploaded.`, type: 'error'});
        }
    }

    // update selected image file for canvas loading
    const _handleChange = (e) => {

        // reset error message
        setMessage(null);

        // reject empty file list
        if (!e.target || !e.target.files) {
            return;
        }

        // Get requested target data
        const { target = {} } = e || {};

        // include local file for upload
        _handleFile(target.files[0] || {});
    };

    // handle files dropped
    const _handleFiles = (files) => {
        // get local file data
        const file = files[0] || {};
        // include local file for upload
        _handleFile(file);
    };

    return <>
        {
            message && <UserMessage onClose={()=>{setMessage(null)}} closeable={true} message={message} />
        }

        <Accordion className={'centered'} label={'Open MLP Library Image File'} type={'image'}>
            {
                !user && <p>Note that a low-resolution version of the selected image will be loaded.</p>
            }
            <Button
                icon={'tree'}
                className={'success'}
                label={'Load image from MLP library.'}
                title={'Opens tree navigator panel. Select a capture image from the right-hand menu.'}
                onClick={() => {
                    nav.setToggle(true);
                    nav.setMode('tree');
                    dialog.setTooltip({
                        message: getTooltip('loadMLPImage'),
                        position: {x: 300, y: 300},
                        direction: 'left'
                    });
                    cancel();
                }}
            />
        </Accordion>

        <Accordion label={'Open Local Image File'} type={'image'} open={true}>
            <InputSelector
                id={'toolkit_loader'}
                type={'file'}
                name={'image_file'}
                value={{importFiles: { name: selectedFile }}}
                files={[selectedFile]}
                onChange={_handleChange}
                onFile={_handleFiles}
            />
        </Accordion>

        {
            <fieldset className={'submit h-menu'}>
                <ul>
                    {
                        selectedImage &&
                        <li key={'submit_selector'}>
                            <Button
                                icon={'load'}
                                label={'Open Image'}
                                onClick={_handleSubmit}
                            />
                        </li>
                    }
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

