/*!
 * MLE.Client.Components.Views.Captures
 * File: capture.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import MetadataView from './metadata.view';
import Carousel from '../common/carousel';
import Table from '../common/table';
import { sanitize } from '../../utils/data.utils.client';
import {createNodeRoute, getExtension} from '../../utils/paths.utils.client';
import Image from '../common/image';
import { useRouter } from '../../providers/router.provider.client';
import { useData } from '../../providers/data.provider.client';
import Tabs from '../common/tabs';
import Comparator from "../common/comparator";
import EditorMenu from "../menus/editor.menu";
import Badge from "../common/badge";

/**
 * View available versions of capture images.
 * - The option to master an image version is available for
 *   modern capture images only.
 *
 * @public
 * @param {String} type
 * @param {Object} owner
 * @param {Array} files
 * @param {Object} refImage
 * @param callback
 * @return {JSX.Element}
 */

export const CaptureImagesTable = ({type, owner, files=[], refImage=null, callback=()=>{}}) => {

    const router = useRouter();
    const api = useData();

    // prepare capture images columns
    const cols = [
        { name: 'thumbnail', label: 'Image', class: 'image-thumbnail'},
        { name: 'details', label: 'Details'},
        { name: 'width', label: 'Width'},
        { name: 'height', label: 'Height'},
        { name: 'file_size', label: 'File Size'},
        { name: 'uploaded', label: 'Uploaded/Updated'},
    ];

    // include editor menu for logged-in users
    cols.push({ name: 'menu', label: '' });

    // prepare capture image data rows
    const rows = files.map(fileData => {

        const { file={}, metadata={}, url={}, label='', filename='' } = fileData || {};
        const {file_type='', id=''} = file || {};
        const { image_states=[] } = api.options || {};

        // select image state label for value (if available)
        const imageState = image_states
            .find(opt => opt.value === metadata.image_state) || { label: metadata.image_state };

        // mark referenced master image
        const isReferencedMaster = refImage ? id === refImage.file.id || '' : false;

        // create table row data
        const row = {
            thumbnail: <Image
                url={url}
                scale={'thumb'}
                caption={filename}
                title={filename}
                onClick={()=>{
                    router.update(createNodeRoute(file_type, 'show', id))
                }}
            />,
            details: <>
                <div>{(metadata.mimetype || getExtension(filename)).toUpperCase()}</div>
                <div>{imageState && imageState.hasOwnProperty('label') ? imageState.label : 'n/a'}</div>
                { isReferencedMaster && <Badge className={'modern_captures'} label={'Compared'} /> }
            </>,
            width: sanitize(metadata.x_dim, 'imgsize'),
            height: sanitize(metadata.y_dim, 'imgsize'),
            uploaded: <>
                <div>{sanitize(file.created_at, 'datetime')}</div>
                <div>{sanitize(file.updated_at, 'datetime')}</div>
            </>,
            file_size: sanitize(file.file_size, 'filesize')
        };

        // include select file metadata
        metadata.filename = file.filename;
        metadata.file_size = file.file_size;
        metadata.mimetype = file.mimetype;

        // add menu
        row.menu = <EditorMenu
            className={'right-aligned'}
            id={id}
            node={file}
            model={type}
            owner={owner}
            label={label}
            metadata={metadata}
            callback={callback}
            visible={['show', 'attach', 'iat', 'edit', 'remove']}
        />;
        return row;
    });

    return  rows.length > 0
        ? <Table rows={rows} cols={cols} className={'files'} />
        : <p>No Images</p>
}

/**
 * Model view component for single capture.
 *
 * @public
 * @param {Object} data
 * @param {String} model
 * @param fileType
 * @return {JSX.Element}
 */

const CaptureView = ({model, data, fileType}) => {

    const api = useData();

    // select capture data
    const {
        id='',
        files={},
        metadata={},
        node={},
        refImage = {},
        attached={} } = api.destructure(data);

    // get capture status
    const { status='unsorted' } = data || {};

    // get capture images
    const captureImages = files.hasOwnProperty(fileType)
        ? files[fileType]
        : [];

    // create tab index of metadata and files
    const _tabItems = [
        {
            label: `Image Viewer`,
            data: <Carousel items={captureImages.map(image => {
                // get node metadata
                const {
                    id = '',
                    node={},
                    file={},
                    owner = {},
                    type = '',
                    label = '',
                    metadata = {}
                } = api.destructure(image) || {};
                const {url={}} = image || {};
                // include file metadata
                const updatedMetadata = Object.keys(file).reduce((o, key) => {
                    o[key] = file[key];
                    return o;
                }, metadata);
                return {
                    id: id,
                    owner: owner,
                    model: type,
                    node: node,
                    url: url,
                    label: label,
                    metadata: updatedMetadata
                }
            })} />,
        },
        {
            label: `Comparisons`,
            data: Object.keys(attached.comparisons || {}).length > 0
                ? <Comparator images={attached.comparisons} />
                : <p>No Paired Images</p>
        },
        {
            label: `Versions`,
            data: <CaptureImagesTable
                type={fileType}
                owner={{ id: id, type: model, sorted: status !== 'unsorted' }}
                files={captureImages}
                refImage={refImage}
            />,
        },
        {
            label: `Details`,
            data: <MetadataView model={model} metadata={metadata} node={node} />,
        },
    ];

    // render capture tabs
    return (
        <Tabs className={'captures'} items={_tabItems} orientation={'horizontal'} />
    )
}

export default CaptureView;