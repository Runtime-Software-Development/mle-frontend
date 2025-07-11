/*!
 * MLE.Client.Components.Editors.Dependents
 * File: dependents.editor.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import {UserMessage} from '../common/message';
import {genID, groupBy} from '../../utils/data.utils.client';
import {useData} from "../../providers/data.provider.client";
import {useRouter} from '../../providers/router.provider.client';
import {useUser} from '../../providers/user.provider.client';
import {genSchema, getModelLabel} from "../../services/schema.services.client";
import {createNodeRoute} from "../../utils/paths.utils.client";
import EditorMenu from "../menus/editor.menu";
import {FilesEditor} from "./files.editor";
import {CapturesEditor} from "./captures.editor";
import Loading from "../common/loading";
import {AttachedMetadataEditor} from "./attached.editor";
import Accordion from "../common/accordion";
import Editor from "./default.editor";
import {useNav} from "../../providers/nav.provider.client";

// generate unique ID value for selector inputs
const keyID = genID();

/**
 * Dependent node selector and editor widget.
 *
 * @public
 * @param {Object} owner
 * @return {JSX.Element}
 */

export const DependentsEditor = ({owner}) => {

    const api = useData();
    const router = useRouter();
    const user = useUser();
    const nav = useNav();

    const _isMounted = React.useRef(false);
    const [message, setMessage] = React.useState(null);
    const [loaded, setLoaded] = React.useState(false);
    const [error, setError] = React.useState(false);

    // set capture selection states
    const [currentDependents, setCurrentDependents] = React.useState([]);
    const [currentFiles, setCurrentFiles] = React.useState([]);

    // cancel dialog editor
    const _handleCancel = () => {
        setLoaded(false);
    }

    // callback for dialog editor
    // - refresh API data
    // - refresh editor data
    // - pop dialog stack
    const _handleCallback = () => {
        setLoaded(false);
    }

    /**
     * Handle API/Navigation state refresh
     *
     * @private
     */

    const _handleRefresh = () => {
        api.refresh();
        nav.refresh();
    }

    /**
     * Load corresponding images for mastering (if requested)
     */

    React.useEffect(() => {
        _isMounted.current = true;
        // request dependents
        if (_isMounted.current && !loaded && !error && owner) {
            router.get(createNodeRoute(owner.type, 'show', owner.id))
                .then(res => {
                    if (_isMounted.current) {
                        if (!res || res.error) {
                            setError(true);
                            return res.hasOwnProperty('error')
                                ? setMessage(res.error)
                                : setMessage({msg: 'Error occurred.', type: 'error'});
                        }

                        // get capture data (if available)
                        const {response = {}} = res || {};
                        const {data = {}} = response || {};
                        const {dependents = [], files = {}, attached = {}} = data || {};
                        setLoaded(true);

                        // no dependent data available
                        if (
                            dependents.length === 0
                            && Object.keys(files).length === 0
                            && Object.keys(attached).length === 0) {
                            setMessage({msg: `No dependent nodes found.`, type: 'info'});
                        }

                        // selected dependents / files / attached metadata
                        // - omit comparisons from attached metadata
                        setCurrentDependents(dependents);
                        setCurrentFiles(files);
                    }
                });
        }
        return () => {
            _isMounted.current = false;
        };
    }, [loaded, error, owner, router]);

    // group dependent nodes by model type
    const dependentsGrouped = groupBy(currentDependents, 'type');

    return <>
        {
            owner && <EditorMenu
                className={'centered'}
                compact={false}
                visible={['new']}
                id={owner.id || ''}
                model={owner.type || ''}
            />
        }
        {
            message && <UserMessage closeable={false} message={message}/>
        }
        {
            // handle attached metadata editor
            user && <AttachedMetadataEditor owner={owner} />
        }
        {
            // handle dependent metadata editor
            user && loaded ?
                <>
                    {
                        Object.keys(dependentsGrouped)
                            .filter(type => dependentsGrouped[type].length > 0)
                            .filter(type => type !== 'historic_captures' && type !== 'modern_captures' )
                            .map((type, index) => {
                                return <div key={`dependents_editors_${keyID}_dependents_${type}_${index}`}>
                                    {
                                        (dependentsGrouped[type] || [])
                                            .map((dependentData, index) => {
                                                const {node={}, label='', metadata={}} = dependentData || {};
                                                const {id=''} = node || {};
                                                return <Accordion
                                                    key={`dep_editor_${keyID}_dependents_${type}_${index}`}
                                                    type={type}
                                                    label={`${getModelLabel(type)} ${getModelLabel(type) !== label ? label : ''}`}
                                                    menu={<EditorMenu
                                                        visible={['edit', 'remove']}
                                                        model={type}
                                                        node={node}
                                                        id={id}
                                                        owner={owner}
                                                        metadata={metadata}
                                                    />}
                                                >
                                                    <Editor
                                                        view={'edit'}
                                                        model={type}
                                                        reference={{
                                                            node: {
                                                                id: id,
                                                                type: type,
                                                                owner: owner
                                                            }
                                                        }}
                                                        schema={genSchema({
                                                            view: 'edit',
                                                            model: type,
                                                            fieldsetKey: '',
                                                            user: user
                                                        })
                                                        }
                                                        route={createNodeRoute(type, 'edit', id)}
                                                        onRefresh={_handleRefresh}
                                                        onCancel={_handleCancel}
                                                        callback={_handleCallback}
                                                    />
                                                </Accordion>
                                            })
                                    }
                                </div>
                            })
                    }
                </>
                : <Loading label={'Loading Dependent Nodes...'} />
        }
        {
            // handle files metadata editor
            user && loaded && <FilesEditor files={currentFiles} owner={owner} callback={_handleCancel}/>
        }
        {
            // handle captures metadata editor
            user && loaded && <CapturesEditor owner={owner} />
        }
    </>;
};