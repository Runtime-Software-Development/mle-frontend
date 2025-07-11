/*!
 * MLE.Client.Components.Menus.Editor
 * File: editor.menu.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Editor menu component.
 *
 * ---------
 * Revisions
 * - 22-07-2023 Include core node data as parameter.
 * - 21-10-2023 Add option to attach capture image for selective download
 */

import React from 'react';
import {getDependentTypes, getModelLabel, isImageType, isCaptureType} from '../../services/schema.services.client';
import Button from '../common/button';
import Dropdown from "../common/dropdown";
import {useUser} from "../../providers/user.provider.client";
import {genID, sanitize} from "../../utils/data.utils.client";
import {createNodeRoute, redirect} from "../../utils/paths.utils.client";
import Download from "../common/download";
import {useDialog} from "../../providers/dialog.provider.client";
import {useNav} from "../../providers/nav.provider.client";
import styles from '../styles/menu.module.css';

/**
 * [Inline and Standalone] General node menu component for selecting view/edit options.
 * - menu options to view, create, edit, delete nodes and add node dependents
 * - displays dialogs for menu selections
 * - uses global navigation provider to select dialog
 *
 * @public
 * @param {String} id
 * @param {String} model
 * @param {String} label
 * @param compact
 * @param {Object} owner
 * @param node
 * @param {Object} metadata
 * @param attached
 * @param files
 * @param size
 * @param visible
 * @param callback
 * @param className
 * @return {JSX.Element}
 */

const EditorMenu = ({
                               id,
                               model,
                               label = '',
                               compact=true,
                               owner = null,
                               node = null,
                               metadata = null,
                               attached={},
                               files={},
                               size= 'lg',
                               visible=[
                                   'show',
                                   'edit',
                                   'remove',
                                   'new',
                                   'attach',
                                   'download',
                                   'extract_map_features',
                                   'view_map_features'
                               ],
                               callback=()=>{},
                               className=''
                           }) => {


    // dialog provider
    const dialog = useDialog();

    // nav provider
    const nav = useNav();

    // get user role
    const user = useUser();
    const {isAdmin=false, isEditor=false} = user || {};

    // destructure file metadata
    const {filename=`download_${model}_${id}`} = metadata || {};

    // get full model label
    const modelLabel = getModelLabel(model);

    // generate unique ID value for form inputs
    const menuID = genID();

    // handle dialog view
    // - sets node data in provider to load in dialog view
    const _handleDialog = (dialogID) => {
        dialog.setCurrent({
            dialogID: dialogID,
            id: id,
            model: model,
            label: label,
            metadata: metadata,
            owner: owner,
            node: node,
            files: files,
            attached: attached,
            callback: callback,
        });
    };

    // get dependent nodes to add to current node
    const dependentTypes = getDependentTypes(model);
    const addItems = (dependentTypes || [])
        .map(dependentType => {
            return {
                icon: 'add',
                type: dependentType,
                label: `Add New ${getModelLabel(dependentType)}`,
                callback: () => {_handleDialog(dependentType)}
            }
        })
        .concat([
            dependentTypes.includes('historic_captures')
                ? {
                    icon: 'import',
                    type: 'historic_captures',
                    label: `Import ${getModelLabel('historic_captures', 'label')}`,
                    callback: () => {_handleDialog('import_hc')}
                } : '',
            dependentTypes.includes('modern_captures')
                ? {
                    icon: 'import',
                    type: 'modern_captures',
                    label: `Import ${getModelLabel('modern_captures', 'label')}`,
                    callback: () => {_handleDialog('import_mc')}
                } : ''
        ])
        .filter(item => !!item);


    // render menu
    return <div className={`h-menu ${className}`}>
        <ul>
            {
                id && metadata && visible.includes('show') &&
            <li key={`${menuID}_node_menuitem_show`}>
                <Button
                    label={compact ? '' : 'View'}
                    size={size}
                    icon={'show'}
                    title={`View ${modelLabel} details.`}
                    onClick={() => {
                        _handleDialog('show')
                    }}
                />
            </li>
            }
            {
                // redirect to node page
                model && id && visible.includes('redirect') &&
                <li key={`${menuID}_node_menuitem_redirect`}>
                    <Button
                        label={compact ? '' : 'Go'}
                        size={size}
                        icon={'externalLink'}
                        title={`Go to ${modelLabel} page.`}
                        onClick={() => { redirect(createNodeRoute(model, 'show', id)) }}
                    />
                </li>
            }
            {
                ( ( id && isCaptureType(model) ) || visible.includes('iat')) &&
                <li key={`${menuID}_node_menuitem_iat`}>
                    <Button
                        label={!compact && 'Align Tool'}
                        size={size}
                        icon={'iat'}
                        title={`Open capture image in Alignment Tool.`}
                        onClick={() => { _handleDialog('iat') }}
                    />
                </li>
            }
            {
                ( id && isImageType(model) && visible.includes('attach') ) &&
                <li key={`${menuID}_menuitem_attach`}>
                    <Button
                        icon={'attach'}
                        label={!compact && 'Attach'}
                        title={`Attach image to selected downloads.`}
                        className={(nav.downloads || []).includes(id) ? styles.active : ''}
                        onClick={() => {
                            nav.addDownload(id);
                        }}
                    />
                </li>
            }
            {
                // Download bulk images for station
                id && model === 'stations' &&  visible.includes('download') &&
                <li key={`${menuID}_node_menuitem_download_bulk`}>
                    <Button
                        label={compact ? '' : 'Bulk Download'}
                        size={size}
                        icon={'bulk_download'}
                        title={`Download Files for ${modelLabel}.`}
                        onClick={() => { _handleDialog('bulkDownload') } }
                    />
                </li>
            }
            {
                // add dropdown menu for adding dependent nodes (exclude images)
                isAdmin && visible.includes('new') && !isImageType(model) &&
                <li key={`${menuID}_node_menuitem_add_new`}>
                    {
                        addItems.length > 0
                            ? <Dropdown compact={compact} label={'Add New'} size={size} icon={'add'} items={addItems} />
                            : <Button
                                label={compact ? '' : 'Add New'}
                                size={size}
                                icon={'add'}
                                title={`Add new ${modelLabel}.`}
                                onClick={() => {_handleDialog('new')}}
                            />
                    }
                </li>
            }
            {
                // Edit node metadata/media
                isAdmin && id && metadata && visible.includes('edit') &&
                <li key={`${menuID}_node_menuitem_edit`}>
                    <Button
                        label={compact ? '' : 'Edit'}
                        size={size}
                        icon={'edit'}
                        title={`Edit ${modelLabel}.`}
                        onClick={() => { _handleDialog('edit') } }
                    />
                </li>
            }
            {
                // Download raw media file
                isEditor && id && isImageType(model) && visible.includes('download') &&
                <li key={`${menuID}_node_menuitem_download_raw_file`}>
                    <Download
                        label={compact ? '' : 'Download'}
                        size={size}
                        filename={`${filename}.zip`}
                        format={'zip'}
                        route={`/files/download/raw?${model}=${id}`}
                        callback={callback}
                    />
                </li>
            }
            {
                // Download public media file
                !isEditor && id && isImageType(model) && visible.includes('download') &&
                <li key={`${menuID}_node_menuitem_download_file`}>
                    <Download
                        label={compact ? '' : 'Download'}
                        size={size}
                        filename={`${filename}.zip`}
                        format={'zip'}
                        route={`/files/download/bulk?${model}=${id}`}
                        callback={callback}
                    />
                </li>
            }
            {
                // Extract map features from uploaded KMZ file
                isAdmin && model === 'map_objects' && id && visible.includes('extract_map_features') &&
                <li key={`${menuID}_node_menuitem_extract_map`}>
                    <Button
                        label={!compact && 'Extract Map'}
                        size={size}
                        icon={'import'}
                        title={`Extract map features from KMZ file.`}
                        onClick={() => { _handleDialog('extract_map_features') }}
                    />
                </li>
            }
            {
                // View map features for node
                model === 'survey_seasons' && id && visible.includes('view_map_features')
                && (attached || {}).maps?.some(map => map.data.map_features_id) &&
                <li key={`${menuID}_node_menuitem_view_map_features`}>
                    <Button
                        icon={'map'}
                        name={'map_view'}
                        label={!compact && 'View Maps'}
                        title={'View linked maps on navigator.'}
                        onClick={() => nav.addToOverlay(
                            (attached || {}).maps
                                .map(({data}) => data.map_features_id) || {}
                        )}
                    />
                </li>
            }
            {
                // Remove node
                isAdmin && id && metadata && visible.includes('remove') &&
                <li key={`${menuID}_node_menuitem_remove`}>
                    <Button
                        label={compact ? '' : 'Delete'}
                        size={size}
                        icon={'delete'}
                        title={`Delete this ${modelLabel}.`}
                        onClick={() => { _handleDialog('remove') }}
                    />
                </li>
            }
        </ul>
    </div>;
};

export default EditorMenu;