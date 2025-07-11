/*!
 * MLE.Client.Components.Editors.Remover
 * File: remover.editor.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from "react";
import { useRouter } from '../../providers/router.provider.client';
import { getModelLabel } from '../../services/schema.services.client';
import { UserMessage } from '../common/message';
import Button from '../common/button';
import MetadataView from "../views/metadata.view";
import Accordion from "../common/accordion";
import {useData} from "../../providers/data.provider.client";
import {useDialog} from "../../providers/dialog.provider.client";
import {useNav} from "../../providers/nav.provider.client";

/**
 * Deletes files/node records.
 *
 * @param id
 * @param model
 * @param data
 * @param onCancel
 * @param callback
 * @public
 */

const Remover = ({
                     id,
                     model,
                     metadata={},
                     onCancel=()=>{},
                     callback=()=>{}
                 }) => {

    const dialog = useDialog();
    const api = useData();
    const nav = useNav();

    const modelLabel = getModelLabel(model);
    const router = useRouter();
    const [response, setResponse] = React.useState(null);
    const [resMessage, setMessage] = React.useState({});

    /**
     * Handle completion of deletion.
     *
     * @private
     */

    const _handleCompletion = (res) => {
        const {response = {}} = res || {};
        const {message={}} = response || {};
        setResponse(response);
        setMessage(message);
        api.refresh();
        nav.refresh();
    }

    /**
     * Handle delete request.
     * - refresh API data after removal
     *
     * @param {Event} e
     * @private
     */

    const _handleSubmit = (e) => {
        if (!e) return;
        e.preventDefault();
        router.remove(id, model, _handleCompletion);
    }

    return <>{
        response ? <div className={'alert-box-buttons'}>
                <UserMessage closeable={false} message={resMessage} />
                <div className={'centred'}>
                    {
                        dialog.hidden &&
                        <Button
                            className={'alert-box-buttons'}
                            icon={'prev'}
                            name={'ok'}
                            label={'Return to Previous Editor'}
                            onClick={() => {
                                api.refresh();
                                dialog.cancel();
                            }}
                        />
                    }
                    <Button
                        icon={'close'}
                        name={'ok'}
                        label={'Close Editor'}
                        onClick={() => {
                            api.refresh();
                            dialog.clear();
                            callback();
                        }}
                    />
                </div>
            </div>
            : <div className={'alert-box'}>
                <p>Please confirm the deletion of this {modelLabel}:</p>
                <Accordion label={'Details'} open={false} type={model}>
                    <MetadataView model={model} metadata={metadata} />
                </Accordion>
                <p>
                    <em>Note that any dependent metadata attached to this record will also be
                        deleted. For example, the deletion of a surveyor record will delete all
                        associated survey metadata.</em>
                </p>
                <div className={'alert-box-buttons'}>
                    <Button
                        icon={'success'}
                        className={'submit'}
                        label={'Delete'}
                        onClick={_handleSubmit}
                    />
                    <Button
                        icon={'cancel'}
                        className={'cancel'}
                        label={'Cancel'}
                        onClick={onCancel}
                    />
                </div>
            </div>
    }</>
}

export default React.memo(Remover);


