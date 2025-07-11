/*!
 * MLE.Client.Components.Selectors.IAT
 * File: loader.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Tabs from "../../common/tabs";
import {UploaderAlignment} from "./uploader.alignment";
import {ImporterAlignment} from "./importer.alignment";
import {useUser} from "../../../providers/user.provider.client";

/**
 * Image selector widget. Used to select an image
 * - from the MLP library via the API to load into IAT
 * - from IAT canvas to upload to MLP library
 *
 *  Input columns (cols) must be object of form:
 *   [...{name: <column name>, label: <column label>}]
 * - Input rows (rows) must be object of form:
 *   [...{[name]: {...[column name]: <row data>}]
 *
 * @public
 * @param {Object} properties
 * @param {Function} callback
 * @param {Function} cancel
 * @return {JSX.Element}
 */

export const LoaderTool = ({id=null, model=null, callback = ()=>{}, cancel=()=>{}}) => {

    const user = useUser();
    const _tabs = [{
        label: `Load in Alignment Tool`,
        data: <ImporterAlignment id={id} callback={callback} cancel={cancel}/>,
    }];

    // Upload restricted to admin users
    if (user) _tabs.push({
        label: `Upload Image to Library`,
        data: <UploaderAlignment id={id} model={model} callback={callback} cancel={cancel} />,
    });

    return <>
        <Tabs orientation={'horizontal'} items={_tabs} />
    </>
}


