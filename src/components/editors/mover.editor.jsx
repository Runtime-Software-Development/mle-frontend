/*!
 * MLE.Client.Components.Editors.Mover
 * File: mover.editor.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from "react";
import { useRouter } from '../../providers/router.provider.client';
import { UserMessage } from '../common/message';
import Button from '../common/button';
import {getModelLabel} from '../../services/schema.services.client';
import {useNav} from "../../providers/nav.provider.client";
import Badge from "../common/badge";
import {useData} from "../../providers/data.provider.client";

/**
 * Moves node to new owner.
 *
 * @param {Function} callback
 * @public
 */

const MoverEditor = ({callback}) => {

    const router = useRouter();
    const nav = useNav();
    const api = useData();

    const [response, setResponse] = React.useState(null);
    const [resMessage, setMessage] = React.useState(null);
    const [source, setSource] = React.useState({});
    const [destination, setDestination] = React.useState({});
    const _isMounted = React.useRef(true);

    // get source/destination for node moves
    React.useEffect(() => {
        _isMounted.current = true;
        if (_isMounted.current && nav.selected) {
            const {source = null, destination = null} = nav.selected || {};
            setSource(source);
            setDestination(destination);
        }
        return () => {
            _isMounted.current = false;
        };
    }, [nav, setSource, setDestination]);

    /**
     * Handle move request.
     *
     * @private
     */

    const _handleSubmit = () => {
        router.get(`/${source.model}/move/${source.id}/${destination.id}`)
            .then(res => {
                if (res.error) setMessage(res.error);
                else _handleCompletion(res);
            }).catch(err => {
            setMessage(err);
        });
    }

    /**
     * Handle completion of move.
     *
     * @private
     */

    const _handleCompletion = (res) => {
        const {response = {}} = res || {};
        const {message={}, data={}} = response || {};
        const {node={}} = data || {};
        setResponse(node);
        setMessage(message);
        api.refresh();
        nav.refresh();
    }

    return <>{
        !response && !resMessage &&
        <div className={'alert-box'}>
            <p className={'centered'}>Please confirm the move of:</p>
            <div className={'h-menu centered'}>
                <ul>
                    <li>
                        <Badge
                            label={`${source.label} (${getModelLabel(source.model)})`}
                            icon={source.model}
                        />
                    </li>
                    <li>
                        <Badge label={''} icon={'hcloseleft'} />
                    </li>
                    <li>
                        <Badge
                            label={`${destination.label} (${getModelLabel(destination.model)})`}
                            icon={destination.model}
                        />
                    </li>
                </ul>
            </div>
            <div className={'alert-box-buttons'}>
                <Button icon={'success'} name={'ok'} label={'Move Item'} onClick={_handleSubmit} />
                <Button icon={'cancel'} name={'cancel'} label={'Cancel'} onClick={callback} />
            </div>
        </div>
    }
        {
            (response || resMessage) &&
            <div>
                <div className={'alert-box-buttons'}>
                    <UserMessage closeable={false} message={resMessage} />
                    <div className={'centred'}>
                        <Button
                            className={'alert-box-buttons'}
                            icon={'success'}
                            name={'done'}
                            label={'Close'}
                            onClick={callback}
                        />
                    </div>
                </div>
            </div>
        }
    </>
}

export default React.memo(MoverEditor);


