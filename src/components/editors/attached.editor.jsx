/*!
 * MLE.Client.Components.Editors.Attached
 * File: attached.editor.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Editor component for node attached metadata.
 *
 * ---------
 * Revisions
 * - 23-07-2023 Refactor out participant groups from attached metadata as new editor component.
 */

import React from 'react';
import {UserMessage} from '../common/message';
import {genID} from '../../utils/data.utils.client';
import {useRouter} from '../../providers/router.provider.client';
import {getModelLabel} from "../../services/schema.services.client";
import {createNodeRoute} from "../../utils/paths.utils.client";
import Accordion from "../common/accordion";
import EditorMenu from "../menus/editor.menu";
import MetadataView from "../views/metadata.view";
import Loading from "../common/loading";
import {useUser} from "../../providers/user.provider.client";
import {ParticipantsView} from "../views/participants.view";

// generate unique ID value for selector inputs
const keyID = genID();

/**
 * Attached node data component.
 * - renders metadata attached to primary node
 * - default: metadata shown in table
 *
 * @public
 * @param {Object} owner
 * @param {Object} model
 * @return {JSX.Element}
 */

export const AttachedMetadataEditor = ({owner}) => {

    const router = useRouter();
    const user = useUser();

    const _isMounted = React.useRef(false);
    const [currentAttached, setCurrentAttached] = React.useState({});
    const [message, setMessage] = React.useState([]);
    const [error, setError] = React.useState(false);
    const [loaded, setLoaded] = React.useState(false);

    /**
     * Load attached metadata for owner
     */

    React.useEffect(() => {
        _isMounted.current = true;
        const {type = '', id = ''} = owner || {};

        if (id && !error && !loaded && owner) {
            router.get(createNodeRoute(type, 'show', id))
                .then(res => {
                    if (_isMounted.current) {
                        if (!res || res.error) {
                            setError(true);
                            return res && res.hasOwnProperty('error')
                                ? setMessage(res.error)
                                : setMessage({msg: 'Error occurred.', type: 'error'});
                        }

                        // get capture data (if available)
                        const {response = {}} = res || {};
                        const {data = {}} = response || {};
                        const {attached = {}} = data || {};

                        // set attached metadata
                        setCurrentAttached(attached);
                        setLoaded(true);
                    }
                })
        }
        return () => {
            _isMounted.current = false;
        };
    }, [error, owner, router]);

    // iterate over attached data types
    return <>
        {
            message && <UserMessage closeable={false} message={message}/>
        }
        {
            user && loaded
                ? Object.keys(currentAttached || {}).map(attachedModel => {
                    // Participants Editor component
                    if (attachedModel === 'participant_groups' && Object.keys(currentAttached[attachedModel]).length > 0) {
                        return <ParticipantsView
                            key={`attached_${keyID}_${attachedModel}`}
                            owner={owner}
                            metadata={currentAttached[attachedModel]}
                        />
                    }
                    // Comparisons Editor component
                    else if (attachedModel === 'comparisons') {
                        return null;
                    }
                    // Attached Metadata Editor component
                    else if (Array.isArray(currentAttached[attachedModel]) && currentAttached[attachedModel].length > 0) {
                        return <Accordion
                            key={`attached_${keyID}_${attachedModel}`}
                            type={attachedModel}
                            label={`${getModelLabel(attachedModel, 'label')}`}
                            className={attachedModel}
                            menu={<EditorMenu
                                visible={['new']}
                                label={getModelLabel(attachedModel, 'label')}
                                model={attachedModel}
                                owner={owner}
                            />}
                        >
                            <div className={`${attachedModel}`}>
                                {
                                    currentAttached[attachedModel].map((attachedItem, index) => {
                                        const {id ='', model='', label = '', data = {}} = attachedItem || {};
                                        const attachedID = data.hasOwnProperty('id') ? data.id : id;
                                        return <div key={`${keyID}_attached_metadata_${model}_${index}`} className={'h-menu'}>
                                            <EditorMenu
                                                className={'right-aligned'}
                                                visible={['edit', 'remove']}
                                                label={getModelLabel(model, 'label')}
                                                model={attachedModel}
                                                id={attachedID}
                                                owner={owner}
                                                metadata={data}
                                            />
                                            <MetadataView
                                                model={attachedModel}
                                                label={label}
                                                node={attachedItem}
                                                metadata={data}
                                            />
                                        </div>
                                    })
                                }
                            </div>
                        </Accordion>
                    }
            }) : <Loading label={'Loading Attached Metadata...'} />
        }
    </>;
};
