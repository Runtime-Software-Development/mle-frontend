/*!
 * MLE.Client.Components.Error.Unavailable
 * File: unavailable.error.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from "react";
import Logo from '../common/logo';

const UnavailableError = () => {

    return (
        <div className="page-content">
            <main>
                <div className={'maintenance'}>
                    <Logo colour={'black'} />
                    <h2>The Mountain Legacy Project Explorer is currently unavailable</h2>
                    <p>Sorry, this application is currently undergoing maintenance
                        and is not available.</p>
                    <p>Please check back soon for updates.</p>
                </div>
            </main>
        </div>

    );
}

export default UnavailableError;
