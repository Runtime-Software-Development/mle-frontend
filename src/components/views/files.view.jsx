/*!
 * MLE.Client.Components.Views.Files
 * File: files.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import FileSelector from '../selectors/file.selector';
import Accordion from '../common/accordion';
import { getModelLabel } from '../../services/schema.services.client';
import { sanitize } from '../../utils/data.utils.client';
import Table from '../common/table';
import EditorMenu from "../menus/editor.menu";
import {useUser} from "../../providers/user.provider.client";

export const
    /**
     * File Table component.
     *
     * @public
     * @param {Object} owner
     * @param {Array} files
     * @param {Boolean} menu
     * @return {JSX.Element}
     */
    FilesTable = ({owner, files = [], menu=false}) => {

        const user = useUser();

        // prepare capture images columns
        const cols = [
            {name: 'download', label: 'Download'},
            {name: 'filename', label: 'Filename'},
            {name: 'mime_type', label: 'Format'},
            {name: 'details', label: 'Details'},
            {name: 'file_size', label: 'File Size'},
            {name: 'created_at', label: 'Uploaded'},
            {name: 'menu', label: ''},
        ];

        // prepare capture image data rows
        const rows = files.map(fileData => {
            const {metadata={}, metadata_type = {}, file = {}, label = ''} = fileData || {};
            const {image_type = ''} = metadata || {};
            const {
                file_type = '',
                id = '',
                mimetype = '-',
                filename = '-',
                file_size = '-',
                created_at = '',
                updated_at = ''
            } = file || {};
            // get file extension
            const ext = filename.split('.').pop() || '';
            // load node metadata with file metadata
            metadata.files_id = id;
            metadata.file_size = file_size;
            metadata.type = metadata_type && metadata_type.hasOwnProperty('name') ? metadata_type.name : image_type;
            metadata.mimetype = mimetype;
            metadata.file_type = file_type;
            metadata.filename = filename;
            metadata.created_at = created_at;
            metadata.updated_at = updated_at;

            // return files row
            return {
                download: <FileSelector data={fileData} scale={'medium'} />,
                filename: <span title={filename}>{String(filename).substring(0, 12) || 'n/a'}</span>,
                mime_type: mimetype || ext,
                details: metadata_type && metadata_type.hasOwnProperty('label')
                    ? metadata_type.label
                    : image_type,
                file_size: sanitize(file.file_size, 'filesize') || 'n/a',
                updated_at: sanitize(metadata.updated_at, 'datetime'),
                created_at: sanitize(metadata.created_at, 'datetime'),
                menu: menu && <EditorMenu
                    size={user ? 'sm' : 'lg'}
                    className={'right-aligned'}
                    id={id}
                    model={file_type}
                    node={file}
                    owner={owner}
                    label={label}
                    metadata={metadata}
                    visible={user ? ['show', 'download', 'edit', 'remove'] : ['show', 'download']}
                />,
            };
        });

        return <Table rows={rows} cols={cols} className={'files'}/>

    },
    /**
     * File list component.
     *
     * @public
     * @param {Array} files
     * @param {Object} owner
     * @return
     */
    FilesList = ({files}) => {
        return Array.isArray(files) && files.length > 0 &&
            <div className={'gallery h-menu'}>
                <ul>
                    {
                        files
                            .map((fileData, index) =>
                                <li key={`gallery_file_${index}`}>
                                    <FileSelector data={fileData} scale={'thumb'} />
                                </li>
                            )
                    }
                </ul>
            </div>
    },
    /**
     * View file records associated with a node as tabs.
     *
     * @public
     * @return {unknown[]}
     */
    FilesView = ({files, owner}) => {

        // check for empty of invalid node list
        if (Object.keys(files).length === 0) return null;

        return Object.keys(files).map((fileType, index) => {
            const {id=''} = files[fileType] || {};
            return files[fileType].length > 0 &&
                <Accordion
                    key={`${fileType}_${id}_${index}`}
                    type={fileType}
                    label={getModelLabel(fileType, 'label')}
                    hasDependents={false}
                    open={true}
                >
                    {
                        fileType === 'metadata_files'
                            ? <FilesTable files={files[fileType]} owner={owner}/>
                            : <FilesList files={files[fileType]} owner={owner}/>
                    }
                </Accordion>
        });
    };


export default FilesView;
