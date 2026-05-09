/*!
 * MLE.Client.Components.Editors.Default
 * File: default.editor.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

import React from "react";
import Form from '../common/form';
import { useRouter } from '../../providers/router.provider.client';
import { getModelLabel, getViewLabel } from '../../services/schema.services.client';
import { useData } from '../../providers/data.provider.client';
import { upload } from '../../services/api.services.client';
import Dialog from "../common/dialog";
import { UserMessage } from "../common/message";
import Button from "../common/button";
import Badge from "../common/badge";
import { createNodeRoute } from "../../utils/paths.utils.client";
import { useDialog } from "../../providers/dialog.provider.client";
import { useNav } from "../../providers/nav.provider.client";

/**
 * Node metadata/media editor.
 *
 * General use editor used to edit metadata, upload files and/or update other data on the server.
 * The user form is built using the base schema (schema.js) for the requested view
 * and model.
 *
 * An API endpoint is a required for form data submissions.
 *
 * @param model
 * @param view
 * @param schema
 * @param batchType
 * @param reference
 * @param route
 * @param files
 * @param loader
 * @param onCancel
 * @param onRefresh
 * @param callback
 * @public
 */

const Editor = ({
    model,
    view,
    schema,
    batchType = '',
    reference,
    route,
    files = [],
    loader = null,
    onCancel = () => { },
    onRefresh = () => { },
    callback = () => { }
}) => {

    const router = useRouter();
    const nav = useNav();
    const api = useData();

    const [progress, setProgress] = React.useState({});
    const [response, setResponse] = React.useState({});
    const [messages, setMessages] = React.useState({});
    const [error, setError] = React.useState(false);
    const [xhr, setXHR] = React.useState(null);

    // determine if confirmation is required for form submission
    // - 'edit' views update but without closing the dialog
    const skipConfirmation = view === 'edit';

    // check if schema includes file uploads
    const hasUploads = schema.hasOwnProperty('hasFiles') ? schema.hasFiles : false;

    // form data loader
    const defaultLoader = async () => {
        const { node = {} } = reference || {};
        const { type = '', id = '', groupType = '' } = node || {};
        if (id && type) {
            return await router.get(createNodeRoute(type, 'show', id, groupType))
                .then(res => {
                    // handle errors
                    if (!res || res.error) {
                        const { msg = 'An error occurred. The form could not load.' } = res.error || {};
                        throw new Error(msg);
                    }
                    // handle node metadata (if available)
                    const { response = {} } = res || {};
                    const { data = {} } = response || {};
                    const { metadata = null } = data || {};
                    return metadata || data;
                });
        }
        return {};
    }

    /**
     * Handle processing error
     *
     * @private
     * @param err
     */

    const _handleError = (err) => {
        console.error(err);
        return err;
    }

    /**
     * Update progress data. Progress data is updated until
     * uploading has completed.
     *
     * @param index
     * @param name
     * @param e
     * @param msg
     * @param res
     * @private
     */

    const _updateProgress = (index, name, e, msg, res) => {
        // update progress indicator only if event available
        if (e) {

            // get loaded/total bytes data from XHR progress event
            // converted to MB for progress bar
            const { loaded = 0, total = 0 } = e || {};

            // update progress state
            const progressData = {
                name: name,
                loaded: (loaded / 1000000).toFixed(2),
                total: (total / 1000000).toFixed(2),
                percent: ((loaded / (total + 0.0000001)) * 100).toFixed(0),
                done: loaded > 0 && total > 0 && total === loaded
            };
            setProgress(data => ({ ...data, [index]: progressData }));
        }

        // update response data and message state
        setResponse(res);
        const { type = '' } = msg || {}
        setMessages(data => ({ ...data, [index]: msg }));
        setError(() => (type === 'error'));
    }

    /**
     * Upload file(s) and metadata. Multiple files uploaded in combined request to API.
     *
     * @private
     * @param formData
     */

    const _importData = async (formData) => {

        // append any additional files to form data
        files.forEach(file => {
            const { name = '', filename = '', value = null } = file || {};
            formData.append(name, value, filename);
        });

        // upload metadata/files via API
        return upload(route, formData, _updateProgress.bind(this, 0, null), router.online)
            .then(xhr => {
                // set the XML request
                setXHR(data => ({ ...data, [0]: xhr }));
            })
            .then(onRefresh)
            .catch(_handleError);
    }

    /**
     * Upload file data. Multiple files uploaded separately
     * to API.
     *
     * @private
     * @param formData
     */

    const _importBatchData = async (formData) => {

        // get files set for bulk import
        const fileList = formData.getAll(batchType);

        // import files individually with same metadata
        await Promise.all(
            fileList.map(async (file, index) => {
                formData.set(batchType, file);
                try {
                    return await upload(route, formData, _updateProgress.bind(this, index, file.name), router.online)
                        .then(xhr => {
                            // get the XML request
                            setXHR(data => ({ ...data, [index]: xhr }));
                        })
                        .then(onRefresh);
                } catch (e) {
                    _handleError(e)
                }
            }));
    }

    /**
     * Handle completion of data import.
     *
     * @private
     */

    const _handleCompletion = () => {
        nav.refresh();
        api.refresh();
        callback(error, model, response?.data?.id, response?.data?.owner_id);
    }

    // short activity description
    const description = error
        ? 'An error occurred.'
        : response && Object.keys(response).length > 0
            ? 'Update is processing ...'
            : 'Uploading in progress ...';

    return (
        <div className={'importer'}>
            <Form
                model={model}
                schema={schema}
                opts={reference}
                loader={loader ? loader : defaultLoader}
                onCancel={onCancel}
                callback={
                    view === 'import' && batchType ? _importBatchData : _importData
                }
                messages={messages}
            />
            <Progress
                title={`${getViewLabel(view)} ${getModelLabel(model)}`}
                description={description}
                progress={progress}
                messages={messages}
                setMessages={setMessages}
                hasUploads={hasUploads}
                hasError={error}
                xhr={xhr}
                onCancel={onCancel}
                callback={_handleCompletion}
                hide={skipConfirmation}
            />
        </div>
    )
}

export default Editor;


/**
 * Shows upload progress and status.
 *
 * @param title
 * @param description
 * @param progress
 * @param xhr
 * @param messages
 * @param setMessages
 * @param hasError
 * @param confirm
 * @param hasUploads
 * @param callback
 * @public
 */

const Progress = ({
    title,
    description,
    progress = {},
    xhr,
    messages,
    setMessages,
    hasError = false,
    hasUploads = false,
    onCancel = () => { },
    callback = () => { },
    hide = false
}) => {

    const [toggle, setToggle] = React.useState(false);
    const [done, setDone] = React.useState(false);
    const [stopped, setStopped] = React.useState(false);
    const _isMounted = React.useRef(true);

    const dialog = useDialog();

    // Open progress bar dialog when progress state is not empty
    React.useEffect(() => {
        _isMounted.current = true;
        setToggle(Object.keys(progress).length > 0);

        // check if progress has completed
        setDone(true);
        Object.keys(progress).forEach(key => {
            if (!progress[key].done) setDone(false);
        });
        return () => {
            _isMounted.current = false;
        };
    }, [progress, setToggle]);

    // Progress results:
    // - file uploads show progress bars
    // - database updates show message
    return !hide && toggle &&
        <Dialog className={'overlay'} title={title} callback={callback}>
            <p className={'centered'}><strong>Status:</strong> {done ? 'Update Completed!' : description}</p>
            {
                Object.keys(progress).map(key => {

                    // get progress indicator data
                    const data = progress[key];
                    const progressBar = {
                        width: `${data.percent}%`,
                    };

                    // render progress indicator for imports
                    return (
                        <div key={`${key}_msg_progress`}>
                            {
                                (hasError || stopped) && <UserMessage closeable={false} message={messages[key]} />
                            }
                            {
                                // show progress bar if import has file uploads and no errors
                                hasUploads && !hasError &&
                                (
                                    <>
                                        <div className={'progress-bar-container'}>
                                            <div className={'progress-bar'} style={progressBar}>
                                                <span>{`${data.percent}%`}</span>
                                            </div>
                                        </div>
                                        <div className={'h-menu'}>
                                            <ul>
                                                <li>
                                                    <Button
                                                        icon={'cancel'}
                                                        name={'cancel'}
                                                        label={'Cancel'}
                                                        disabled={done}
                                                        onClick={
                                                            () => {
                                                                if (xhr.hasOwnProperty(key)) xhr[key].abort();
                                                                setStopped(true);
                                                                setMessages(data => (
                                                                    {
                                                                        ...data,
                                                                        [key]: {
                                                                            msg: 'Upload Stopped!',
                                                                            type: 'warning'
                                                                        },
                                                                    }),
                                                                );
                                                            }} />
                                                </li>
                                                <li><Badge
                                                    title={'Upload progress.'}
                                                    icon={'upload'}
                                                    label={`${(data.loaded)}MB of ${(data.total)}MB 
                                                    [File(s): ${data.name ? data.name : 'Multiple'}]`}
                                                />
                                                    {
                                                        done && <Badge icon={'success'} className={'success'} label={'Completed!'} />
                                                    }
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                )
                            }
                        </div>
                    );
                })
            }
            {
                !hasUploads &&
                Object.keys(messages).map(key => {
                    return <UserMessage key={`progress_update_${key}`} closeable={false} message={messages[key]} />
                })
            }
            {
                done && <div className={'alert-box-buttons'}>
                    {
                        dialog.hidden &&
                        <Button
                            className={'alert-box-buttons'}
                            icon={'prev'}
                            name={'ok'}
                            label={'Return to Previous Editor'}
                            onClick={onCancel}
                        />
                    }
                    <Button
                        icon={'close'}
                        name={'ok'}
                        label={'Close Editor'}
                        onClick={callback}
                    />
                </div>
            }
        </Dialog>
};
