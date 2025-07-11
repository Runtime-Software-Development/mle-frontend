/*!
 * MLE.Client.Components.Selectors.Dialog
 * File: dialog.selector.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Dialog selector component. Integrates with dialog provider.
 *
 * ---------
 * Revisions
 * - 22-07-2023    Include basic node data to include create and last modified dates.
 * - 23-12-2023    Added new Map Object dialog for KMZ data files
 */

import React from 'react';
import {createNodeRoute, redirect} from '../../utils/paths.utils.client';
import {useUser} from '../../providers/user.provider.client';
import {genSchema, getDependentTypes, getModelLabel} from '../../services/schema.services.client';
import Editor from '../editors/default.editor';
import Exporter from '../tools/export.tools';
import Downloader from '../tools/download.tools';
import Dialog from '../common/dialog';
import MetadataView from '../views/metadata.view';
import Remover from '../editors/remover.editor';
import OptionsView from '../editors/options.editor';
import HelpView from '../views/help.view';
import FilterNavigator from "../navigator/filter.navigator";
import Mover from "../editors/mover.editor";
import Button from "../common/button";
import {useDialog} from "../../providers/dialog.provider.client";
import {useData} from "../../providers/data.provider.client";
import {useNav} from "../../providers/nav.provider.client";
import {LoaderTool} from "../alignment/tools/loader.alignment";
import Accordion from "../common/accordion";
import Image from "../common/image";
import MapSelector from "./map.selector";
import {MapEditor} from "../editors/map.editor";

/**
 * Dialog view for selecting forms/content to display in dialog popup components.
 *
 * @public
 */

const DialogSelector = () => {

    const user = useUser();
    const api = useData();
    const nav = useNav();
    const dialog = useDialog();

    // create and display dialog popup
    const showDialog = (data, index) => {

        // destructure dialog data
        const {
            dialogID='',
            model = '',
            id = '',
            label = '',
            file = {},
            files = {},
            owner = null,
            node={},
            metadata = null,
            attached = {},
            url = '',
            scale = 'medium',
            callback = ()=>{}
        } = data || {};

        // generate unique key for dialog
        const _key = `dialog_${dialogID}_${model}_${id}_${index}`;

        // get model label
        const modelLabel = getModelLabel(model);

        // get optional group type used as fieldset selector (if exists)
        const {group_type = '' } = metadata || {};

        // handle callback and data refresh
        const _handleCallback = (data) => {
            if (callback) callback(data);
            dialog.clear();
        }

        // handle callback for inline editors
        const _handleEditCallback = () => {
            if (callback) callback();
        }

        // cancel operation
        const _handleCancel = () => {
            dialog.cancel();
        }

        // cancel operation
        const _handleDialogClose = () => {
            dialog.clear();
        }

        // handle refresh
        const _handleRefresh = () => {
            api.refresh();
            nav.refresh();
        }

        // define the popup dialogs
        const _editorDialogs = {
            help: <Dialog
                key={_key}
                title={'Mountain Legacy Explorer User Guide'}
                callback={_handleDialogClose}
            >
                <HelpView />
            </Dialog>,
            show: <Dialog
                key={_key}
                className={index > 0 ? 'hidden' : ''}
                title={`${modelLabel} Details`}
                callback={_handleDialogClose}
            >
                <MetadataView
                    model={model}
                    node={node}
                    metadata={metadata}
                    file={file}
                    attached={attached}
                    files={files}
                />
                <div className={'centred'}>
                    <Button
                        className={'cancel'}
                        icon={'cancel'}
                        label={'Close Info Panel'}
                        onClick={_handleCancel}
                    />
                </div>
            </Dialog>,
            new: <Dialog
                key={_key}
                title={`Add New ${getModelLabel(model)}`}
                callback={_handleDialogClose}
                className={index > 0 ? 'hidden' : ''}
            >
                <Editor
                    view={'new'}
                    model={model}
                    reference={{
                        node: {
                            id: null,
                            type: model,
                            owner: owner,
                            groupType: group_type
                        }
                    }}
                    schema={genSchema({view: 'new', model: model, user: user})}
                    route={createNodeRoute(model, 'new', owner && owner.hasOwnProperty('id') ? owner.id : '', group_type)}
                    onRefresh={_handleRefresh}
                    onCancel={_handleCancel}
                    callback={_handleCallback}
                />
            </Dialog>,
            edit: <Dialog
                key={_key}
                title={`Edit ${getModelLabel(model)}${label ? ': ' + label : ''}`}
                callback={_handleDialogClose}
                className={index > 0 ? 'hidden' : ''}
            >
                <Editor
                    view={'edit'}
                    model={model}
                    reference={{
                        node: {
                            id: id,
                            type: model,
                            owner: owner,
                            groupType: group_type
                        }
                    }}
                    schema={genSchema({view: 'edit', model: model, fieldsetKey: group_type, user: user})}
                    route={createNodeRoute(model, 'edit', id, group_type)}
                    onRefresh={_handleRefresh}
                    onCancel={_handleCancel}
                    callback={_handleEditCallback}
                />
            </Dialog>,
            remove: <Dialog
                key={_key}
                title={`Delete ${getModelLabel(model)} ${label ? ': ' + label : ''}`}
                callback={_handleDialogClose}
                className={index > 0 ? 'hidden' : ''}
            >
                <Remover
                    id={id}
                    model={model}
                    label={label}
                    owner={owner}
                    groupType={group_type}
                    metadata={metadata}
                    callback={(err, model) => {
                        model === 'projects' || model === 'surveyors' ? redirect('/') : _handleCallback();
                    }}
                    onCancel={_handleCancel}
                /></Dialog>,
            filter: <Dialog key={_key} title={`Filter Map Stations`} callback={_handleDialogClose}>
                <FilterNavigator/>
            </Dialog>,
            map_features: <Dialog key={_key} title={`View Map Features`} callback={_handleDialogClose}>
                <MapSelector callback={_handleCallback} />
            </Dialog>,
            move: <Dialog key={_key} title={`Move Item to New Container (Owner)`} callback={_handleDialogClose}>
                <Mover callback={_handleCallback} />
            </Dialog>,
            iat: <Dialog key={_key} title={`Transfer Image to/from Image Toolkit`} callback={_handleDialogClose}>
                <Accordion label={`MLP Container Source/Target: ${label || 'unknown'}`} type={model} open={false}>
                    <MetadataView node={owner} model={model} metadata={metadata} />
                </Accordion>
                <LoaderTool
                    id={id}
                    model={model}
                    callback={_handleDialogClose}
                    cancel={_handleCancel}
                />
            </Dialog>,
            options: <Dialog
                key={_key}
                title={'Manage Metadata Options'}
                callback={_handleDialogClose}
                className={index > 0 ? 'hidden' : ''}
            >
                <OptionsView type={'options'} onCancel={_handleCancel} />
            </Dialog>,
            import_hc: <Dialog
                key={_key}
                title={`Bulk ${getModelLabel('historic_captures', 'label')} Import`}
                callback={_handleDialogClose}
                className={index > 0 ? 'hidden' : ''}
            >
                <p>
                    Use this form to import multiple capture images. Each image
                    will generate a unique historic or modern capture entry.
                    Metadata included below will apply to each imported capture.
                </p>
                <Editor
                    view={'import'}
                    model={'historic_captures'}
                    batchType={'historic_images'}
                    schema={genSchema({view: 'import', model: 'historic_captures', user: user})}
                    route={createNodeRoute('historic_captures', 'import', id)}
                    onRefresh={_handleRefresh}
                    onCancel={_handleCancel}
                    callback={_handleCallback}
                />
            </Dialog>,
            import_mc: <Dialog
                key={_key}
                title={`Bulk ${getModelLabel('modern_captures', 'label')} Import`}
                callback={_handleDialogClose}
                className={index > 0 ? 'hidden' : ''}
            >
                <p>
                    Use this form to import multiple capture images. Each image
                    will generate a unique historic or modern capture entry.
                    Metadata included below will apply to each imported capture.
                </p>
                <Editor
                    view={'import'}
                    model={'modern_captures'}
                    batchType={'modern_images'}
                    schema={genSchema({view: 'import', model: 'modern_captures', user: user})}
                    route={createNodeRoute('modern_captures', 'import', id)}
                    onRefresh={_handleRefresh}
                    onCancel={_handleCancel}
                    callback={_handleCallback}
                />
            </Dialog>,
            exporter: <Dialog
                key={_key}
                title={`Export Metadata to File`}
                callback={_handleDialogClose}
            >
                <Exporter />
            </Dialog>,
            bulkDownload: <Dialog
                key={_key}
                title={`Bulk Download Images`}
                callback={_handleDialogClose}
                className={index > 0 ? 'hidden' : ''}
            >
                <Downloader id={id} />
            </Dialog>,
            bulk_download_selections: <Dialog
                key={_key}
                title={`Bulk Download Selected Images`}
                callback={_handleDialogClose}
                className={index > 0 ? 'hidden' : ''}
            >
                <Downloader />
            </Dialog>,
            new_surveyor: <Dialog
                key={_key}
                title={'Add New Surveyor'}
                callback={_handleDialogClose}
                className={index > 0 ? 'hidden' : ''}
            >
                <Editor
                    view={'new'}
                    model={'surveyors'}
                    route={createNodeRoute('surveyors', 'new')}
                    schema={genSchema({view: 'new', model: 'surveyors', user: user})}
                    onRefresh={_handleRefresh}
                    onCancel={_handleCancel}
                    callback={(error, model, id) => {
                        error ? _handleCallback() : redirect(createNodeRoute(model, 'show', id));
                    }}
                />
            </Dialog>,
            new_project: <Dialog
                key={_key}
                title={'Create New Project'}
                callback={_handleDialogClose}
                className={index > 0 ? 'hidden' : ''}
            >
                <Editor
                    view={'new'}
                    model={'projects'}
                    route={createNodeRoute('projects', 'new')}
                    schema={genSchema({view: 'new', model: 'projects', user: user})}
                    onRefresh={_handleRefresh}
                    onCancel={_handleCancel}
                    callback={(error, model, id) => {
                        error ? _handleCallback() : redirect(createNodeRoute(model, 'show', id));
                    }}
                />
            </Dialog>,
            new_map_object: <Dialog
                key={_key}
                title={'Upload New Map Data File'}
                callback={_handleDialogClose}
                className={index > 0 ? 'hidden' : ''}
            >
                <Editor
                    view={'new'}
                    model={'map_objects'}
                    route={createNodeRoute('map_objects', 'new')}
                    schema={genSchema({view: 'new', model: 'map_objects', user: user})}
                    onRefresh={_handleRefresh}
                    onCancel={_handleCancel}
                    callback={(error, model, id) => {
                        error ? _handleCallback() : redirect(createNodeRoute(model, 'show', id));
                    }}
                />
            </Dialog>,
            extract_map_features: <Dialog
                key={_key}
                title={`Extract Map Features from File`}
                callback={_handleDialogClose}
                className={index > 0 ? 'hidden' : ''}
            >
                <p>
                    Use this form to extract map features from a KMZ file.
                </p>
                <MapEditor
                    id={id}
                    onRefresh={_handleRefresh}
                    onCancel={_handleCancel}
                    callback={_handleCallback}
                />
            </Dialog>,
            image: <Dialog className={'wide'} key={_key} title={`Image: ${label}`} callback={_handleDialogClose}>
                <Image url={url} title={label} scale={scale} />
                <div className={'centred'}>
                    <Button
                        className={'cancel'}
                        icon={'cancel'}
                        label={'Close Panel'}
                        onClick={_handleCancel}
                    />
                </div>
            </Dialog>
        };

        // create add new dependents dialog popups for requested model
        const _dependentDialogs = (getDependentTypes(model) || []).reduce((o, dependent, dependentIndex) => {
            o[dependent] = <Dialog
                key={`${_key}_${dependent}_${dependentIndex}`}
                title={`Add New ${getModelLabel(dependent)}`}
                callback={_handleDialogClose}
                className={index > 0 ? 'hidden' : ''}
            >
                <Editor
                    view={'add'}
                    model={dependent}
                    reference={{
                        node: {
                            id: null,
                            type: dependent,
                            owner: {
                                id: id,
                                type: model
                            }
                        }
                    }}
                    schema={genSchema({view: 'new', model: dependent, user: user})}
                    route={createNodeRoute(dependent, 'new', id)}
                    onRefresh={_handleRefresh}
                    onCancel={_handleCancel}
                    callback={_handleCallback}
                />
            </Dialog>;
            return o;
        }, {});

        return _editorDialogs.hasOwnProperty(dialogID)
            ? _editorDialogs[dialogID]
            : _dependentDialogs.hasOwnProperty(dialogID)
                ? _dependentDialogs[dialogID]
                : <Dialog
                    key={_key} title={'An Error Occurred'}
                    callback={_handleDialogClose}
                >
                    <h2>Operation Not Found</h2>
                    <p>Sorry, the system encountered an error. Please close this dialog box.</p>
                    <p><Button type={'cancel'} label={'Close'} icon={'close'} onClick={_handleCancel} /></p>
                </Dialog>
    }

    return <>
        {
            dialog.current ? dialog.stack.map(showDialog).reverse() : <></>
        }
    </>;
};

export default DialogSelector;
