/*!
 * MLE.Client.Components.Common.Footer
 * File: footer.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import {getInfo} from "../../services/schema.services.client";
import {MLPLogo} from "../common/logo";

/**
 * Render .page footer
 *
 * @public
 * @return {JSX.Element}
 */

const Footer = () => {
    const date = new Date();
    return <footer className="footer">
            <div className={'copyright h-menu'}>
                <ul>
                    <li>
                        <p>Copyright &copy; {date.getFullYear()} Mountain Legacy Project</p>
                    </li>
                    <li className={'push'} style={{paddingRight: '20px'}}>
                        <a href={getInfo().mlp_url} rel="noreferrer" target={'_blank'}>
                            <MLPLogo colour={'#2ea591'} />
                        </a>
                    </li>
                </ul>
            </div>
        </footer>
}

export default React.memo(Footer);
