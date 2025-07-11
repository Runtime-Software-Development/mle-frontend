/*!
 * MLE.Client.Components.Error.Access
 * File: access.error.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from "react";
import {UserMessage} from "../common/message";

const AccessError = () => {
    return <>
            <h2>Access Denied</h2>
                <UserMessage
                    className={'msg error'}
                    message={{msg: 'This page is only accessible to authenticated users.', type: 'error'}}
                    closeable={false}
                />
            <p>Return to the <a href={"/"}>Explorer Homepage</a>.</p>
        </>;
}

export default AccessError;
