/*!
 * MLE.Client.Components.Common.SingleSelect
 * File: singleselect.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import { sorter } from '../../utils/data.utils.client';

/**
 * Build multiselect widget.
 *
 * @public
 * @param id
 * @param name
 * @param label
 * @param value
 * @param disabled
 * @param required
 * @param disabled
 * @param options
 * @param onChange
 * @param onSelect
 */

const SingleSelect = ({ id, name, label, value, disabled, required, options, onChange, onSelect }) => {
    // prepare options data for select input
    const opts = options
        .sort(sorter)
        .map((opt, index) => {
            const {value = '', label = ''} = opt || {};
            return <option
                key={`${id}_${name}_${value}_${index}`}
                id={`${id}_${name}_${value}`}
                name={`${name}_${value}`}
                value={value || ''}>{label}</option>;
        });

    return <select
        id={id}
        name={name}
        disabled={disabled || options.length === 0}
        onChange={onChange}
        onSelect={onSelect}
        value={value || ''}
        required={required}
    >
        <option
            key={`default_${id}_${name}`}
            id={`default_${id}_${name}`}
            name={`default_${id}_${name}`}
            value={''}
        >
            {label} ...
        </option>
        {opts}
    </select>;
};

export default SingleSelect;