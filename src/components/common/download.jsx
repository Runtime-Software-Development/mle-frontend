/*!
 * MLE.Client.Components.Common.Download
 * File: download.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import { useRouter } from '../../providers/router.provider.client';
import { download } from '../../services/api.services.client'
import Button from './button';
import {genID} from "../../utils/data.utils.client";

/**
 * Defines download button.
 *
 * @public
 * @param filename
 * @param format
 * @param label
 * @param route
 * @param className
 * @param size
 * @param callback
 * @param save
 * @return {JSX.Element}
 */

const Download = ({
                      filename='',
                      format='',
                      label='',
                      route=null,
                      className='',
                      size='lg',
                      callback=()=>{},
                      save=true
                  }) => {

    // download link
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState(null);

    // create download ID
    const id = genID();

    // handle error events
    const _handleError = (err) => {
        console.error(err);
        setLoading(false);
        setMessage({msg: label ? 'File download failed.' : '', type: 'error'});
        callback({msg: 'Download error. The server may be unavailable.', type:'error'});
    }

    /**
     * Update progress data. Progress data is updated until
     * uploading has completed.
     *
     * @param error
     * @param e
     * @private
     */

    const _handleProgress = (error, e) => {
        // handle error
        if (error) _handleError(error);
        // update progress indicator only if event available
        if (e) {
            // get loaded/total bytes data from XHR progress event
            // - converted to MB
            const { loaded = 0, total = 0, type='' } = e || {};

            const completedBytes = (loaded / 1000000).toFixed(2);
            const totalBytes = (total / 1000000).toFixed(2);
            const percent = (100 * (completedBytes / totalBytes)).toFixed(0);
            const notProgressive = total === 0;
            const done = (total > 0 && loaded > 0 && total === loaded) || type === 'loadend';

            // update progress state
            if (!notProgressive) setMessage({msg: `${percent}%`, type: 'info'});
            else setMessage({msg: `${completedBytes}MB`, type: 'info'});

            // end loading
            if (done) {
                setMessage(null);
                setLoading(false);
            }
        }
        else {
            setMessage(null);
            setLoading(false);
        }
    }

    // Handler for file download request.
    const _handleDownload = async () => {
        // save data stream to file
        try {
            setLoading(true);
            // upload metadata/files via API
            await download(
                route,
                _handleProgress,
                filename || `file_${id}.${format}`,
                router.online,
                save
            ).catch(_handleError);
            callback();
        }
        catch (err) {
            _handleError(err)
        }
    }

    // render download button
    return <Button
            disabled={loading}
            size={size}
            icon={
                loading
                    ? 'spinner'
                    : message && message.type === 'error'
                        ? 'error'
                        : format === 'zip' ? 'bulk_download' : 'download'
            }
            spin={loading}
            label={message ? message.msg : loading && label ? 'Downloading...' : label}
            className={`${className} ${message ? message.type : ''}`}
            title={
                message && message.hasOwnProperty('msg')
                    ? message.msg
                    : `Download ${filename || `file_${id}.${format}`}.`
            }
            onClick={_handleDownload}>
        </Button>
}

export default Download;

