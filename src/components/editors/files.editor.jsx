/*!
 * MLE.Client.Components.Editors.Files
 * File: files.editor.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import {genID} from '../../utils/data.utils.client';
import {getModelLabel} from "../../services/schema.services.client";
import Accordion from "../common/accordion";
import {FilesTable} from "../views/files.view";
import {CaptureImagesTable} from "../views/capture.view";

// generate unique ID value for selector inputs
const keyID = genID();

/**
 * Files selector and editor widget. Used to edit dependent files in editor.
 *
 * @public
 * @param {Object} files
 * @param {Object} owner
 * @return {JSX.Element}
 */

export const FilesEditor = ({files, owner}) => {
    return <>
        {
            Object.keys(files)
                .map((fileKey, index) => {
                    return <Accordion
                        key={`selector_${keyID}_files_${fileKey}_${index}`}
                        label={getModelLabel(fileKey, 'label')}
                        type={fileKey}
                    >
                        {
                            fileKey !== 'modern_images' && fileKey !== 'historic_images'
                                ? <FilesTable
                                    menu={true}
                                    files={files[fileKey]}
                                    owner={owner}
                                />
                                : <CaptureImagesTable
                                    files={files[fileKey]}
                                    owner={owner}
                                    type={fileKey}
                                />
                        }
                    </Accordion>
                })
        }</>
}