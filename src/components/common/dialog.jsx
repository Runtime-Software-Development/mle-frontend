/*!
 * MLE.Client.Components.Common.Dialog
 * File: dialog.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import {useNav} from "../../providers/nav.provider.client";

/**
 * Dialog component.
 *
 * @param {String} title
 * @param {String} className
 * @param {Function} callback
 * @param children
 * @public
 */

const Dialog = ({title, className='', callback=()=>{}, children}) => {

    // create DOM reference for dialog box
    const container = React.useRef(null);

    // get nav provider
    const nav = useNav();

    // scroll to top of dialog
    React.useEffect(() => {
        if (container.current) container.current.scrollIntoView();
    }, [container]);

    return (
        <div className={`dialog ${className ? className : ''} ${nav.compact ? 'wide' : ''}`}>
            <div className={'content-box'}>
                <div className={'dialog-header'}>
                    <h2 className={'dialog-title'} id="dialog-title">{title}</h2>
                    <div style={{position: 'absolute', right: 0, top: '2px'}}>
                        <Button
                            title={'Close dialog box.'}
                            label={'Close'}
                            icon={'close'}
                            name={'close'}
                            className={'closer'}
                            onClick={callback}
                        />
                    </div>

                </div>
                <div ref={container} className={'dialog-body'} aria-labelledby="dialog-title">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Dialog;
