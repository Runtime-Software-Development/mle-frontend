/*!
 * MLE.Client.Components.Tools.Downloader
 * File: download.tools.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Selective downloader component.
 *
 * ---------
 * Revisions
 * - 10-21-2023   Changed to user-selected images.
 */

import React from "react";
import { UserMessage } from '../common/message';
import Accordion from '../common/accordion'
import Button from '../common/button';
import Download from "../common/download";
import Badge from "../common/badge";
import {useRouter} from "../../providers/router.provider.client";
import {useDialog} from "../../providers/dialog.provider.client";
import {useNav} from "../../providers/nav.provider.client";
import Loading from "../common/loading";
import Image from "../common/image";
import {groupBy, humanize, sanitize} from "../../utils/data.utils.client";
import {
    getDownloads
} from "../../services/session.services.client";
import styles from '../styles/download.module.css';
import {useUser} from "../../providers/user.provider.client";
import Table from "../common/table";

/**
 * Bulk downloader
 * all historical captures, all modern captures; available historical,
 * available moderns; field note data; station details; location images.
 *
 * @public
 * @param id
 * @return {JSX.Element}
 */

const Downloader = ({id}) => {

    const router = useRouter();
    const dialog = useDialog();
    const nav = useNav();

    // get user role
    const user = useUser();
    const {isEditor=false} = user || {};

    // create dynamic data states
    const [loadedData, setLoadedData] = React.useState(null);
    const [selected, setSelected] = React.useState(getDownloads() || []);
    const [size, setSize] = React.useState(0);
    const [isEmpty, setIsEmpty] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [message, setMessage] = React.useState(null);
    const _isMounted = React.useRef(true);

    // prepare image table columns
    const cols = [
        {name: 'thumbnail', label: 'Image'},
        {name: 'filename', label: 'Filename'},
        {name: 'mime_type', label: 'Format'},
        {name: 'size', label: 'File Size'},
        {name: 'details', label: 'Details'}
    ];

    // retrieve capture images for node
    // API call to retrieve node data (if not yet loaded)
    React.useEffect(() => {
        _isMounted.current = true;

        // API call for page data
        if (!error && !loadedData && id) {
            router.get(`/files/select/${id}`)
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {
                        if (res.error) return setError(res.error);
                        const { response = {} } = res || {};
                        const { data = {} } = response || {};
                        // check if empty of downloadables
                        setIsEmpty(Object.keys(data).filter(key => data[key].length > 0).length === 0);
                        setLoadedData(data);
                    }
                })
                .catch(err => console.error(err),
                );
        }
        // handle selected images option
        if (!error && !loadedData && !id) {
            const fileIDs = getDownloads() || [];
            // set selected to 'all'
            setSelected(fileIDs);
            // query files by filtered id array
            router.get(`/files/filter?ids=${fileIDs.join('+')}`)
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {
                        if (res.error) return setError(res.error);
                        const { response = {} } = res || {};
                        const { data = {} } = response || {};
                        // set empty flag
                        setIsEmpty(data.length === 0);
                        // group file results by file type
                        const filtered = groupBy(data, 'file_type');
                        // put file metadata into state
                        setLoadedData(filtered);
                    }
                })
                .catch(err => console.error(err),
                );

        }
        return () => {
            _isMounted.current = false;
        };
    }, [error, loadedData, setLoadedData, id, router]);

    /**
     * Compute package download size
     * @param selected
     * @param loadedData
     * @private
     */
    React.useEffect(() => {
        const total = (selected || []).map(id => {
            const {files} = (options || []).find(opt => opt.data.includes(id)) || {};
            const {file_size} = (files || []).find(f => f.id === id) || {};
            return parseInt(file_size);
        }).reduce((partialSum, a) => partialSum + a, 0);
        setSize(total);
    }, [selected, loadedData]);

    /**
     * Flatten capture object to collect file IDs
     * @param images
     * @private
     */
    const _getFileIDs = (images) => {
        return [].concat.apply([], images)
            .map(img => {
                const {id=null} = img || {}
                return id
            });
    }

    /**
     * Flatten capture object to collect file names
     * @param images
     * @private
     */
    const _getFileList = (images) => {
        return [].concat.apply([], images)
            .map(img => {
                const {id, filename, url, file_size, mimetype, updated_at, created_at, image_type, image_state} = img || {};
                return {
                    className: selected.includes(id) ? styles.active : styles.inactive,
                    onClick: () => {_handleSelect(id)},
                    id: id,
                    file_size: file_size,
                    thumbnail: <div className={'h-menu centred'}>
                        <ul style={{margin : 'auto', justifyContent: 'center'}} className={'centred'}><li><Image
                            url={url}
                            scale={'thumb'}
                            title={`Add ${sanitize(file_size, 'filesize')} image.`}
                            onClick={() => {_handleSelect(id)}}
                        /></li></ul>
                    </div>,
                    filename: String(filename).substring(0, 20),
                    mime_type: mimetype || 'n/a',
                    size: sanitize(file_size, 'filesize') || 'n/a',
                    details: <div>
                        <div>{humanize(image_type || image_state)} Image</div>
                        <div>Uploaded: {sanitize(created_at, 'datetime')}</div>
                    </div>
                }
            });
    }

    /**
     * Get updated query of file IDs
     * - ids are grouped by file type
     * @private
     * @return string
     */
    const _getFileQuery = () => {
        // group selected IDs by image file type (dict)
        const filtered = selected.reduce((o, id) => {
            const {value} = (options || []).find(opt => opt.data.includes(id)) || {};
            if (value) {
                if (o.hasOwnProperty(value) && Array.isArray(o[value]) && o[value].length > 0) o[value].push(id)
                else o[value] = [id];
            }
            return o;
        }, {});
        // construct query string grouped by image file types
        return Object.keys(filtered)
            .map(key => {return `${key}=${filtered[key].join('+')}`})
            .join('&');
    }

    // initialize image options for download
    const options = [
        {
            value: 'historic_images',
            label: 'Historic Capture Images',
            files: loadedData && loadedData.hasOwnProperty('historic_images')
                ? _getFileList(loadedData.historic_images)
                : [],
            data: loadedData && loadedData.hasOwnProperty('historic_images')
                ? _getFileIDs(loadedData.historic_images)
                : [],
        },
        {
            value: 'modern_images',
            label: 'Modern Capture Images',
            files: loadedData && loadedData.hasOwnProperty('modern_images')
                ? _getFileList(loadedData.modern_images)
                : [],
            data: loadedData && loadedData.hasOwnProperty('modern_images')
                ? _getFileIDs(loadedData.modern_images)
                : [],
        },
        {
            value: 'unsorted_images',
            label: 'Unsorted Capture Images',
            files: loadedData && loadedData.hasOwnProperty('unsorted_images')
                ? _getFileList(loadedData.unsorted_images)
                : [],
            data: loadedData && loadedData.hasOwnProperty('unsorted_images')
                ? _getFileIDs(loadedData.unsorted_images)
                : [],
        },
        {
            value: 'supplemental_images',
            label: 'Supplemental Images',
            files: loadedData && loadedData.hasOwnProperty('supplemental_images')
                ? _getFileList(loadedData.supplemental_images)
                : [],
            data: loadedData && loadedData.hasOwnProperty('supplemental_images')
                ? _getFileIDs(loadedData.supplemental_images)
                : [],
        }
    ];

    /**
     * Callback for download operation.
     * @private
     * @param {Event} err
     */
    const _handleCallback = (err) => {
        if (!id) nav.clearDownloads();
        // err ? setMessage(err) : dialog.cancel();
    }

    /**
     * Handler for cancel operation
     * @private
     */
    const _handleCancel = () => {
        dialog.cancel();
    }

    /**
     * Handler to reset image selection
     * @private
     */
    const _handleReset = () => {
        setSelected([]);
    };

    /**
     * Handler for clearing selected downloads (when selected)
     * @private
     */
    const _handleClearDownloads = () => {
        nav.clearDownloads();
        dialog.cancel();
    }

    /**
     * Handler for image download selection
     *
     * @param id
     * @private
     */
    const _handleSelect = (id) => {
        // toggle inclusion of selected id
        selected.includes(id)
            ? setSelected(data => {return data.filter(o => o !== id)})
            : setSelected(data => ([ ...data, id ]));
    };

    // render download-as button
    return <fieldset className={'submit'}>
        {
            !isEditor && <p>Note that low-resolution versions of selected images will be downloaded.</p>
        }
        { !loadedData && <Loading label={'Loading...'}/> }
        { isEmpty && <UserMessage message={{msg: 'No downloads available', type: 'warning'}} closeable={false} /> }
        <UserMessage message={message} closeable={true} />
        <div>
            <div>
                {
                    options.map((filegroup, index) => {
                        return Array.isArray(filegroup.files) && filegroup.files.length > 0 &&
                            <Accordion open={true} label={filegroup.label} type={filegroup.value} key={`download-filelist-${index}`}>
                                <Table rows={filegroup.files} cols={cols} className={'files'}/>
                            </Accordion>
                    })
                }
            </div>
            <Badge
                className={'active'}
                label={isEditor
                    ? `${selected.length} images selected for download. Package Size: ${sanitize(size, 'filesize')}`
                    : `${selected.length} images selected for download.`}
                icon={selected.length > 1 ? 'images' : 'image'}
            />
            <div className={'h-menu'}>
                <ul>
                    {
                        Array.isArray(selected) && selected.length > 0 &&
                        <li>
                            <Download
                                className={'submit'}
                                filename ={`mlp_download.zip`}
                                format={'zip'}
                                label={`Download`}
                                route={
                                    isEditor
                                        ? `/files/download/raw?${_getFileQuery()}`
                                        : `/files/download/bulk?${_getFileQuery()}`
                                }
                                callback={_handleCallback}
                            />
                        </li>
                    }
                    <li>
                        <Button
                            icon={'cancel'}
                            label={'Cancel'}
                            className={'cancel'}
                            onClick={_handleCancel}
                        />
                    </li>
                    <li>
                        <Button
                            icon={'reset'}
                            label={'Reset'}
                            className={'reset'}
                            onClick={_handleReset}
                        />
                    </li>
                    {
                        !id &&
                        <li>
                            <Button
                                icon={'delete'}
                                label={'Clear Downloads'}
                                className={'reset'}
                                onClick={_handleClearDownloads}
                            />
                        </li>
                    }
                </ul>

            </div>
        </div>
    </fieldset>;
}

export default Downloader;


