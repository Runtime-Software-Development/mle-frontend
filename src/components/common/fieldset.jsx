/*!
 * MLE.Client.Components.Common.Fieldset
 * File: fieldset.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * General fieldset component configured to include input fields defined in the
 * base schema (schema.js) and initialized using field data data passed
 * from the form component.
 *
 * ---------
 * Revisions
 *
 *
 */

import React from 'react'
import InputSelector from '../selectors/input.selector';
import Button from './button';
import { useData } from '../../providers/data.provider.client';
import Accordion from "./accordion";

/**
 * Fieldset Component
 *
 * Build form fieldset element with inputs. 'Fields' are defined
 * as HTML components containing input elements plus form validation
 * and labels.
 *
 * @public
 * @param params
 * @return fieldset element
 */

const Fieldset = ({
                      formID,
                      model,
                      index,
                      mode,
                      legend,
                      fields,
                      errors,
                      setErrors,
                      data,
                      onChange,
                      remove,
                      validators,
                      opts={},
                      isDisabled=false,
                      disabledInputs={},
                      collapsible=true,
                      open=true
}) => {

    // get fieldset options (if available)
    // - create deep copy of global API options object
    // - insert local options into options copy to pass to inputs
    const api = useData();
    const optionsData = JSON.parse(JSON.stringify(api.options));
    Object.keys((opts || {})).map(key => {
        return optionsData[key] = opts[key];
    });

    /**
     * Input on-change handler. Updates references state.
     *
     * @public
     * @param {Object} e
     */

    const _handleChange = e => {
        const { target={} } = e || {};
        const { name='', value='' } = target;
        const attachedFiles = target.files && Object.keys(target.files).length > 0
            ? target.files
            : {};

        // update state with input data
        onChange(name, value);

        // update files (if exist)
        if (Object.keys(attachedFiles).length > 0) {
            onChange(name, attachedFiles);
        }

        // update validation errors
        setErrors(errors => ({
            ...errors,
            [name]: validators[name].check(value || attachedFiles)
        }));
    }

    /**
     * Input on-file include handler. Updates references state.
     *
     * @public
     * @param {Array} files
     * @param name
     */

    const _handleFiles = (files, name) => {

        if (!files) return;

        // update files (if exist)
        if (files.length > 0) {
            onChange(name, files);
        }

        // update validation errors
        setErrors(errors => ({...errors, [name]: validators[name].check(files)}));
    }

    /**
     * Input on-change handler. Updates references state.
     *
     * @public
     * @param name
     * @param options
     */

    const _handleMultiselect = (name, options) => {

        // update state with input data
        onChange(name, options);

        // update validation errors
        setErrors(errors => ({...errors, [name]: validators[name].check(options)}));
    }

    /**
     * Fieldset component.
     * Note: Ensure legend is added to schema to display fieldset.
     *
     * @public
     * @param name
     * @param options
     */

    const fieldset = <fieldset
        name={`${formID}_fieldset_${model}_${index}`}
        className={legend ? '' : 'hidden'}
        disabled={isDisabled}
    >
        {
            mode==='copy'
                ? <div className={'removeField'}>
                    <Button
                        key={`${formID}_fieldset_remove_${index}`}
                        onClick={remove}
                        label={`Remove ${legend}`}
                        icon={'minus'} />
                </div>
                : <></>
        }
        {
            // render form input fields
            Object.keys(fields || {}).map(key => {

                // get form schema for requested model
                const { label='', render='', name='', reference='', attributes={}, readonly=false } = fields[key];
                const _value = data && data.hasOwnProperty(key) ? data[key] : '';
                const _error = errors && errors.hasOwnProperty(key) ? errors[key] : '';
                const _options = optionsData && optionsData.hasOwnProperty(reference) ? optionsData[reference] : [];
                const _disabled = disabledInputs && disabledInputs.hasOwnProperty(name) ? disabledInputs[name]: false;
                const _isRequired = validators.hasOwnProperty(name)
                    ? validators[name].validations.includes('isRequired') : false;
                const _prefix = attributes.hasOwnProperty('prefix') ? attributes.prefix : '';
                const _suffix = attributes.hasOwnProperty('suffix') ? attributes.suffix : '';
                const _min = attributes.hasOwnProperty('min') ? attributes.min : '';
                const _max = attributes.hasOwnProperty('max') ? attributes.max : '';
                const _multiple = attributes.hasOwnProperty('multiple') ? attributes.multiple : '';

                return (
                    <InputSelector
                        key={`${formID}_input_${name}_${key}`}
                        id={formID}
                        type={render}
                        name={name}
                        label={label}
                        readonly={readonly}
                        prefix={_prefix}
                        suffix={_suffix}
                        min={_min}
                        max={_max}
                        value={_value}
                        required={_isRequired}
                        error={_error}
                        options={_options}
                        multiple={_multiple}
                        disabled={_disabled}
                        onMultiselect={_handleMultiselect}
                        onChange={_handleChange}
                        onFile={_handleFiles}
                    />
                )
            })
        }
    </fieldset>

    // render fieldset component
    return <>
        {
            collapsible
            ? <Accordion className={legend ? '' : 'hidden'} label={legend} open={open}>{fieldset}</Accordion>
            : fieldset
        }
        </>
}

export default Fieldset;
