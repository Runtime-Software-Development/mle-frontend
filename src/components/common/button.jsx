/*!
 * MLE.Client.Components.Common.Button
 * File: button.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

import React from 'react';
import Icon from './icon';

/**
 * Render HTML button element.
 *
 * @public
 * @return {React.Component}
 */

const Button = ({
                    type,
                    name,
                    disabled=false,
                    label='',
                    title,
                    icon,
                    size='lg',
                    className='',
                    spin=false,
                    onClick=()=>{}
}) => {

    /**
     * Button constructors for different render types.
     *
     * @private
     * @return {Function} input constructor
     */

    // Build a safe DOM title attribute value.
    // React warns when booleans are passed to non-boolean attributes.
    const safeLabel = typeof label === 'string' ? label : '';
    const normalizedTitle = (typeof title === 'string' || typeof title === 'number')
        ? String(title)
        : safeLabel
            ? safeLabel
            : undefined;
    const domTitle = normalizedTitle === undefined ? {} : { title: normalizedTitle };

    const _buttonElements = {
        submit: () => {
            return (
                <button
                    disabled={disabled}
                    className={className}
                    {...(normalizedTitle === undefined ? { title: 'Submit update.' } : domTitle)}
                    type={'submit'}
                    name={name}>
                    { icon ? <Icon type={icon} size={size} /> : ''}{ label ? <span>{label}</span> : ''}
                </button>
            )
        },
        reset: () => {
            return (
                <button
                    disabled={disabled}
                    className={className}
                    {...(normalizedTitle === undefined ? { title: 'Reset form.' } : domTitle)}
                    type={'reset'}
                    name={name}
                    value={label}
                    onClick={onClick}
                ><Icon type={'reset'} size={size} /> Reset</button>)
        },
        rightAlign: () => {
            return (
                <button
                    disabled={disabled}
                    {...domTitle}
                    className={className}
                    onClick={onClick}
                    name={name}
                >
                    { label ? <span>{label}</span> : ''}{ icon ? <Icon type={icon} size={size} /> : ''}
                </button>)
        },
        default: () => {
            return (
                <button
                    disabled={disabled}
                    {...domTitle}
                    className={className}
                    onClick={onClick}
                    name={name}
                >
                    { icon ? <Icon type={icon} size={size} spin={spin} /> : ''}{ label ? <span>{label}</span> : ''}
                </button>
            )
        }
    }

    // render input
    return _buttonElements.hasOwnProperty(type)
        ? _buttonElements[type]()
        : _buttonElements.default();
}

export default Button;
