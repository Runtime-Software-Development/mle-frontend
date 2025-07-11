/*!
 * MLE.Client.Toolkit.Loaders.Downloader
 * File: downloader.alignment.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from '../../common/button';
import InputSelector from '../../selectors/input.selector';
import { useIat } from "../../../providers/alignment.provider.client";

/**
 * Defines download local file button. Expects callback to retrieve data
 * as Blob for the selected file format.
 *
 * @public
 * @return {JSX.Element}
 */

export const SaveAs = ({ callback=()=>{} }) => {

    const iat = useIat();
    const [format, setFormat] = React.useState(null);

    // Handler for file format selection.
    const _handleSelect = (e) => {
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

    // Handler for file save as request.
    // - set canvas properties for file save
    const _handleDownload = () => {
        callback(format);
        iat.setDialog(null);
    };

    // render download-as button
    return <fieldset className={'submit'}>
        <InputSelector
            label={'Save the file as'}
            type={'select'}
            options={iat.options.formats}
            value={format && format.type}
            onChange={_handleSelect}
        />
        {
            format &&
                <>
                    <Button
                        name={'save'}
                        icon={'download'}
                        label={`Save As ${String(format.ext).toUpperCase()}`}
                        title={`Save As ${String(format.ext).toUpperCase()}`}
                        onClick={_handleDownload}>
                    </Button>&#160;
                    <Button icon={'cancel'} label={'Cancel'} onClick={()=>{iat.setDialog(null)}} />
            </>
        }
    </fieldset>;
};
