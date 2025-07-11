/*!
 * MLE.Client.Components.Tools.Exporter
 * File: exporter.tools.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from "react";
import Download from '../common/download';
import { UserMessage } from '../common/message';
import InputSelector from '../selectors/input.selector';
import Button from '../common/button';
import {useDialog} from "../../providers/dialog.provider.client";

/**
 * Exports full metadata in selected format
 *
 * @public
 */

const Exporter = () => {

    const dialog = useDialog();

    const options = [
        { label: 'CSV (GIS)', value: 'csv', endpoint: 'gis/csv' },
        { label: 'JSON (GIS)', value: 'json', endpoint: 'gis/json' }
    ];

    const [format, setFormat] = React.useState(null);
    const [message, setMessage] = React.useState(null);

    const _handleError = (err) => {
        setMessage(err);
    }

    // Handler for file format selection.
    const _handleSelect = (e) => {
        const { target = {} } = e || {};
        const { value = '' } = target;
        const opt = options.find(opt => value === opt.value);
        setFormat(opt);
    };

    // render download-as button
    return <fieldset className={'submit'}>
        <UserMessage message={message} closeable={false} />
        <p>Export and download raw capture metadata available in different formats.</p>
        <fieldset>
            <InputSelector
                label={'Export as'}
                type={'select'}
                options={options}
                value={format ? format.value : ''}
                onChange={_handleSelect}
            />
        </fieldset>
        {
            format &&
            <div className={'h-menu'}>
                <ul>
                    <li>
                        <Download
                            className={'submit'}
                            filename ={`mlp_export.${format.value}`}
                            type={'mlp_export'}
                            format={format.value}
                            label={`Export as ${ format.label }`}
                            route={`/nodes/export/${format.endpoint}`}
                            callback={_handleError}
                        />
                    </li>
                    <li>
                        <Button
                            className={'cancel'}
                            icon={'cancel'}
                            label={'Cancel'}
                            onClick={dialog.clear}
                        />
                    </li>
                </ul>
            </div>
        }
    </fieldset>;
}

export default Exporter;


