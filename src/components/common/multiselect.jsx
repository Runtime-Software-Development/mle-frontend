/*!
 * MLE.Client.Components.Common.Multiselect
 * File: multiselect.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import { sorter } from '../../utils/data.utils.client';
import InputSelector from '../selectors/input.selector';

/**
 * No operation.
 */

const noop = () => {
};

/**
 * Build multiselect widget.
 *
 * @public
 * @param id
 * @param name
 * @param selected
 * @param required
 * @param disabled
 * @param options
 */

const MultiSelect = ({ id, name, label, selected, required, options, onSelect }) => {

    // create selection list references
    const unselectedRef = React.useRef(null);
    const selectedRef = React.useRef(null);

    // prepare options data for multiselect input
    const getUnselectedOpts = () => {
        return options
            .sort(sorter)
            .map(opt => {
                const { value = '', label = '' } = opt || {};
                return <option
                    key={`${id}_${name}_${value}`}
                    id={`${id}_${name}_${value}`}
                    name={`${name}_${value}`}
                    value={value || ''}
                    disabled={(selected || []).some(item => parseInt(item.value) === parseInt(value))}
                >{label}</option>;
            });
    };

    // generate option elements from selection list
    const getSelectedOpts = () => {
        return (selected || [])
            .sort(sorter)
            .map(opt => {
                const { value = '', label = '' } = opt || {};
                return <option
                    key={`${id}_${name}_${value}`}
                    id={`${id}_${name}_${value}`}
                    name={`${name}_${value}`}
                    value={value || ''}
                >{label}</option>;
            });
    };

    // generate hidden elements from selection list
    const getHiddenOpts = () => {
        return (selected || [])
            .map((opt, index) => {
                const { value = '' } = opt || {};
                return <InputSelector
                    type={'hidden'}
                    key={`${id}_${name}_${value}`}
                    id={`${id}_${name}_${value}`}
                    name={`${name}[${index}]`}
                    value={value || ''}
                />;
            });
    };

    // add item to selection
    const selectOption = (e) => {
        e.preventDefault();

        // move chosen unselected opts to selected list
        updateSelect([...unselectedRef.current.options]
            .filter(opt => opt.selected || (selected || []).some(
                selectedOpt => String(selectedOpt.value) === String(opt.value)),
            ));
    };

    // remove item from selection
    const deselectOption = (e) => {
        e.preventDefault();

        // get options chosen to be deselected
        updateSelect([...selectedRef.current.options]
            .filter(opt => !opt.selected));
    };

    // reset selection with initialization data
    const reset = (e) => {
        e.preventDefault();
        updateSelect([]);
    };

    // update data state for field
    const updateSelect = (options) => {
        // update data state
        onSelect(
            name,
            options.map(opt => {
                return {
                    label: opt.label,
                    value: opt.value,
                };
            }),
        );
    };

    return <div className={'multiselect h-menu'}>
        <ul>
            <li>
                <select
                    ref={unselectedRef}
                    id={id}
                    name={'unselectedOptions'}
                    onChange={noop}
                    multiple={true}
                    placeholder={label}
                >
                    {getUnselectedOpts()}
                </select>
            </li>
            <li className={'multiselect-controls'}>
                <Button
                    icon={'prev'}
                    onClick={deselectOption}
                />
                <Button
                    icon={'undo'}
                    onClick={reset}/>
                <Button
                    icon={'next'}
                    onClick={selectOption}/>
            </li>
            <li>
                <select
                    ref={selectedRef}
                    id={id}
                    name={'selectedOptions'}
                    onChange={noop}
                    required={required}
                    multiple={true}
                >
                    {getSelectedOpts()}
                </select>
                {getHiddenOpts()}
            </li>
        </ul>
    </div>;
};

export default MultiSelect;