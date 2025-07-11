/*!
 * MLE.Client.Components.Common.Message
 * File: message.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Icon from './icon';

/**
 * System message component.
 *
 * @param closeable
 * @param message
 * @param icon
 * @param timeout
 * @param className
 * @param callback
 * @public
 */

const Message = ({
                     closeable=true,
                     message=null,
                     icon='info',
                     timeout=false,
                     className='',
                     callback=()=>{}
}) => {

    const [msgData, setMsgData] = React.useState(message);
    const { msg = '', type = 'error' } = message || {};
    const _isMounted = React.useRef(null);

    // set message data
    React.useEffect(() => {
        _isMounted.current = true;
        if (_isMounted.current) setMsgData(message)
        return () => {
            _isMounted.current = false;
        };
    }, [message]);

    /**
     * Set interval timout if requested.
     *
     * @public
     */

    if (timeout) {
        setInterval(()=>{message = null}, 1500)
    }

    /**
     * Handle message closing.
     *
     * @public
     */

    const _handleClose = () => {
        setMsgData(null);
        callback();
    };

    return !!msgData && !!type &&
        <div className={`msg ${type} ${className}`}>
            {
                (icon || type) && <div className={`msg-icon`}><Icon type={icon || type} /></div>
            }
            <div className={'msg-text'}>{msg}</div>
            {
                closeable &&
                <div className={'close'}>
                    <Button className={type} icon={'close'} onClick={_handleClose} />
                </div>
            }
        </div>;
};

export default Message;

/**
 * Generic user message component.
 * - Prints first message to page
 * - use for form and control validation
 *
 * @public
 * @param message
 * @param timeout
 * @param closeable
 * @param scrollTo
 * @param className
 * @param icon
 * @param onClose
 */

export const UserMessage = ({
                                message,
                                closeable = true,
                                scrollTo=false,
                                className = '',
                                icon=null,
                                onClose=()=>{}
                            }) => {

    const container = React.useRef(null);
    const { msg = '', type = 'error' } = message || {};
    const [toggle, setToggle] = React.useState(true);

    // scroll to position of message on page
    React.useEffect(() => {
        if (scrollTo && container.current) container.current.scrollIntoView();
    }, [container, scrollTo]);

    /**
     * Load initial input image data (if in query parameters)
     */

    React.useEffect(() => {
        setToggle(true);
    }, [message]);

    return toggle && !!msg && !!type &&
        <div ref={container} className={`msg ${type} ${className}`}>
            {
                (icon || type) && <div className={`msg-icon`}><Icon type={icon || type} /></div>
            }
            <div className={'msg-text'}>{msg}</div>
            {
                closeable &&
                <div className={'close'}>
                    <Button className={type}
                            icon={'close'}
                            onClick={() =>{
                                setToggle(false);
                                onClose();
                            }}
                    />
                </div>
            }
        </div>;
};