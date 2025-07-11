/*!
 * MLE.Client.Components.Common.Submit
 * File: submit.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';

/**
 * Form submission buttons component.
 *
 * @public
 * @param model
 * @param label
 * @param icon
 * @param disable
 * @param onCancel
 * @param onReset
 * @param onSubmit
 */

export const Submit = ({
                           model,
                           label = '',
                           icon='submit',
                           disabled=false,
                           onCancel,
                           onReset,
                           onSubmit = true,
                       }) => {

    return (
        <fieldset className={'submit'}>
            {onSubmit &&
            <Button
                disabled={disabled}
                icon={icon}
                className={'submit'}
                type={'submit'}
                label={label || 'Submit'}
                name={`submit_${model}`}
            />}
            {onReset &&
            <Button
                disabled={disabled}
                className={'reset'}
                icon={'reset'}
                type={'reset'}
                label={'Reset'}
                name={`reset_${model}`}
                onClick={onReset}
            />}
            {onCancel &&
            <Button
                disabled={disabled}
                icon={'cancel'}
                className={'cancel'}
                type={'cancel'}
                label={'Close'}
                name={`cancel_${model}`}
                onClick={(e) => {
                    e.preventDefault();
                    onCancel()
                }}
            />}
        </fieldset>

    );
};