/*!
 * MLE.Client.Components.Selectors.Input
 * File: input.selector.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Selects form input component.
 *
 * ---------
 * Revisions
 * - 16-09-2023   Converted coordinate input to new component.
 *
 */

import React from 'react';
import 'flatpickr/dist/themes/material_green.css';
import Icon from '../common/icon';
import Message, {UserMessage} from '../common/message';
import MultiSelect from '../common/multiselect';
import DateTimeSelector from './datetime.selector';
import {AttachedMetadataEditor} from "../editors/attached.editor";
import {DependentsEditor} from "../editors/dependents.editor";
import {ComparisonEditor} from "../editors/comparison.editor";
import Coord from "../common/coord";
import SingleSelect from "../common/singleselect";
import MapSelector from "./map.selector";

/**
 * No operation.
 */

const noop = () => {
};

/**
 * Form input component.
 *
 * <input type="hidden">
 * <input type="text"> [normal | small]
 * <textarea>
 * <input type="checkbox">
 * <input type="number"> [int | float]
 * <DateTimeSelector> [year | date | datetime | time]
 * <input type="email">
 * <input type="password">
 * <select> [select | multiselect]
 * <input type="file"> [single | multiple]
 * <input type="range">
 * <dependentsEditor
 * <attachedMetadataEditor>
 * <comparisonEditor>
 */

export const InputSelector = ({
                          id,
                          type,
                          name,
                          label = '',
                          value = '',
                          min = 0,
                          max = 99999,
                          prefix = '',
                          suffix = '',
                          error = null,
                          required = false,
                          readonly = false,
                          multiple = false,
                          disabled = false,
                          ariaLabel = '',
                          options = null,
                          onMultiselect = noop,
                          onChange = noop,
                          onSelect = noop,
                          onFile = noop,
                      }) => {

    // input conditional states
    const [autoClick, setAutoClick] = React.useState(true);

    // create event listener for file input
    // - simulates a click of the file browser
    const [highlight, setHighlight] = React.useState(false);

    // define label-less inputs
    const noLabel = [
        'hidden',
        'file',
        'dependentEditor',
        'compareSelector',
        'attachedMetadataEditor',
        'generateMapFeatures'
    ];

    // append unique ID value for input
    id = `${name}_${id}`;

    /**
     * Input constructors for different render types.
     *
     * @private
     * @return {Function} input constructor
     */

    const _inputElements = {

        hidden: () => {
            return <input
                readOnly={true}
                type={'hidden'}
                id={id}
                name={name}
                value={value || ''}
                required={required}
            />;
        },

        text: () => {
            return <input
                readOnly={readonly}
                type={'text'}
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />;
        },

        smallText: () => {
            return <input
                readOnly={readonly}
                className={'short'}
                type={'text'}
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />;
        },

        textarea: () => {
            return <textarea
                id={id}
                name={name}
                readOnly={readonly}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />;
        },

        json: () => {
            return <textarea
                id={id}
                name={name}
                readOnly={readonly}
                value={typeof value === 'string' ? value : JSON.stringify(value, undefined, 4) || ''}
                required={required}
                onChange={(e)=>{
                    onChange(e);
                }}
                aria-label={ariaLabel}
            />;
        },

        checkbox: () => {
            const isChecked = (value && value === true);
            return <input
                readOnly={readonly}
                disabled={disabled}
                type={'checkbox'}
                id={id}
                value={value || ''}
                name={name}
                checked={isChecked}
                required={required}
                onChange={() => {
                    onChange({
                        target: {
                            name: name,
                            value: !value
                        }
                    })
                }
                }
                aria-label={ariaLabel}
            />;
        },

        int: () => {
            return <input
                    readOnly={readonly}
                    disabled={disabled}
                    type={'number'}
                    placeholder={0}
                    step={1}
                    min={min}
                    max={max}
                    id={id}
                    name={name}
                    value={value || ''}
                    required={required}
                    onChange={onChange}
                    aria-label={ariaLabel}
                />;
        },

        float: () => {
            return <>
                <input
                    readOnly={readonly}
                    disabled={disabled}
                    type={'number'}
                    placeholder={0.000}
                    min={min}
                    max={max}
                    step={'any'}
                    id={id}
                    name={name}
                    value={value || ''}
                    required={required}
                    onChange={onChange}
                    aria-label={ariaLabel}/>
            </>;
        },

        year: () => {
            return <input
                readOnly={readonly}
                disabled={disabled}
                type={'number'}
                placeholder={new Date().getFullYear()}
                min={1800}
                max={new Date().getFullYear()}
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />;
        },

        coord: () => {
            return <Coord
                id={id}
                value={value}
                readOnly={readonly}
                name={name}
                selected={value || ''}
                label={label}
                required={required}
                disabled={disabled}
                options={options}
                onChange={onChange}
            />;
        },

        date: () => {
            return <DateTimeSelector
                name={name}
                value={value ? new Date(value) : value}
                filter={'date'}
                onChange={onChange}
            />;
        },

        datetime: () => {
            return <DateTimeSelector
                name={name}
                value={value || ''}
                filter={'datetime'}
                onChange={onChange}
            />;
        },

        time: () => {
            return <DateTimeSelector
                name={name}
                value={value || ''}
                filter={'time'}
                onChange={onChange}
            />;
        },

        email: () => {
            return <input
                type={'email'}
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />;
        },

        password: () => {
            return <input
                readOnly={autoClick}
                type={'password'}
                autoComplete="chrome-off"
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                onClick={() => {
                    setAutoClick(false);
                }}
                onFocus={() => {
                    setAutoClick(false);
                }}
            />;
        },

        select: () => {
            return <SingleSelect
                id={id}
                readOnly={readonly}
                name={name}
                value={value || ''}
                label={label}
                required={required}
                disabled={disabled}
                options={options}
                onChange={onChange}
                onSelect={onSelect}
            />;
        },

        reference: () => {
            return <SingleSelect
                id={id}
                readOnly={readonly}
                name={name}
                value={value || ''}
                label={label}
                required={required}
                disabled={disabled}
                options={options}
                onChange={onChange}
                onSelect={onSelect}
            />
        },

        multiselect: () => {
            return <MultiSelect
                id={id}
                readOnly={readonly}
                name={name}
                selected={value || ''}
                label={label}
                required={required}
                disabled={disabled}
                options={options}
                onSelect={onMultiselect}
            />;
        },

        range: () => {
            return <input
                type={'range'}
                readOnly={readonly}
                disabled={disabled}
                min={min}
                max={max}
                id={id}
                name={name}
                value={value || ''}
                required={required}
                onChange={onChange}
                aria-label={ariaLabel}
            />
        },

        dependentsEditor: () => {
            return <DependentsEditor owner={options} />;
        },

        attachedMetadataEditor: () => {
            return <AttachedMetadataEditor owner={options} />;
        },

        comparisonEditor: () => {
            return <ComparisonEditor
                reference={options}
                name={name}
                label={label}
                value={value || []}
                required={required}
                disabled={disabled}
                options={options}
                onSelect={onMultiselect}
            />;
        },

        mapFeature: () => {
            return <MapSelector callback={onChange} single={true} value={value || ''} />;
        },

        file: () => {

            /**
             * Drag-over file selector.
             *
             * @public
             * @param {Object} e
             */

            const _handleDragOver = (e) => {
                e.preventDefault();
                e.stopPropagation();
                setHighlight(true);
            };

            /**
             * Drag-and-drop file inputs. Updates references state.
             *
             * @public
             * @param {Object} e
             */

            const _handleDrop = (e) => {
                e.preventDefault();
                // handle files to update form data state
                const {dataTransfer = {}} = e || {};
                const {files = {}} = dataTransfer || {};
                onFile(files, name)
                setHighlight(false);
            };

            // extract file names
            const files = Object.keys(value).map(fkey => {
                return value[fkey].name
            }) || [];

            return <>
                <label
                    key={`label_${name}`}
                    className={`file-upload ${highlight ? 'ondrag' : ''}`}
                    htmlFor={id}
                    onDragOver={_handleDragOver}
                    onDrop={_handleDrop}>
                    <input
                        type={'file'}
                        id={id}
                        name={name}
                        required={required}
                        onChange={onChange}
                        multiple={multiple}
                    />

                    <Icon type={'import'}/>&#160;
                    <span>{multiple ? 'Import Multiple Files' : 'Import File'}</span>
                    <div>{files.join(', ')}</div>
                </label>
            </>;
        },
    };

    // get input element
    const input = _inputElements.hasOwnProperty(type)
        ? _inputElements[type]()
        : <Message message={{msg: 'Loading Error', type: 'error'}} closeable={false}/>;

    return noLabel.includes(type)
        ? <>
            {input}
            {<UserMessage message={error} closeable={false}/>}
        </>
        : <>
            <label key={`label_${name}`} htmlFor={id} className={type}>
                {type !== 'checkbox' ? <span className={'label-text'}>{label}</span> : ''}
                <span className={'units'}>{prefix}</span>
                {input}
                {type === 'checkbox' ? <span className={'label-text'}>{label}</span> : ''}
                <span className={'units'}>{suffix}</span>
            </label>
            {
                <UserMessage message={error} closeable={false}/>
            }
        </>;
};

export default InputSelector;
