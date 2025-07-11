/*!
 * MLE.Client.Components.Common.Form
 * File: form.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * General form component configured to include fieldsets defined in the
 * base schema (schema.js) and must correspond to fields defined in the
 * initialization data (init).
 *
 * A callback is required to handle the data submission.
 * Note about Form ID: do not use the FormID as a constantly changing key
 * - see: https://stackoverflow.com/a/59287017
 *
 * ---------
 * Revisions
 * - 30-11-2023   Fixed form reset to nullify form data in-component
 *
 */

import React from 'react';
import Fieldset from './fieldset';
import Button from './button';
import Validator from '../../utils/validator.utils.client';
import { Submit } from './submit';
import { extractFieldIndex } from '../../utils/data.utils.client';
import { useNav } from "../../providers/nav.provider.client";
import Loading from "./loading";
import Message, { UserMessage } from "./message";
import { getError } from "../../services/schema.services.client";

// default form error
const defaultError = { msg: getError(), type: 'error' };

// default noop
const noop = async () => { };

/**
 * Defines general form component.
 *
 *
 * @public
 * @param {String} model
 * @param {Object} schema
 * @param {Object} init
 * @param {Function} callback Callback function
 * @param onChange
 * @param onCancel
 * @param onReset
 * @param opts
 * @param allowEmpty
 * @param disabledInputs
 * @param children
 */

const Form = ({
    model,
    schema,
    loader = noop,
    callback,
    messages = {},
    onChange = () => { },
    onCancel = () => { },
    onReset = () => { },
    opts = null,
    allowEmpty = false,
    disabledInputs = {},
    children,
}) => {

    // get form input settings from schema
    const { attributes = {}, fieldsets = [], view = '' } = schema || {};
    const { submit = '', method = 'POST' } = attributes || {};

    // generate unique ID value for form inputs
    const formID = `_form_${model}_${view}_`;

    // initialize state for input parameters
    // const [data, setData] = React.useState({});
    const [data, setData] = React.useState({});
    const [loaded, setLoaded] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [fieldsetSchema, setFieldsetSchema] = React.useState([]);
    const [modified, setModified] = React.useState(false);
    const [isDisabled, setDisabled] = React.useState(true);

    // create input error states / message state
    const [errors, setErrors] = React.useState({});
    const [message, setMessage] = React.useState({});

    const nav = useNav();

    // initialize fieldset schema on navigation change
    // - set fieldset schema to initial schema if not modified in form editor
    React.useEffect(() => {
        // setLoaded(false);
        if (fieldsets.length !== 0) {
            // ensure fieldsets are initialized
            setFieldsetSchema(fieldsets);
        }
    }, [fieldsets, nav]);

    // initialize fieldset schema
    // - set fieldset schema to initial schema if not modified in form editor
    React.useEffect(() => {
        if (!modified && fieldsets.length !== 0 && !loading) {
            // ensure fieldsets are initialized
            setFieldsetSchema(fieldsets);
        }
    }, [fieldsets, modified, loading]);


    const _loadFormData = () => {
        // load form data
        loader()
            .then(data => {
                // set metadata in external state
                setData(data);
                setLoaded(true);
            })
            .catch(err => {
                console.error(err);
                setMessage(data => ({ ...data, '0': defaultError }));
            })
            .finally(() => { setLoading(false) });
        setLoading(false);
        setDisabled(false);
    }

    // update form data on dialog change
    React.useEffect(_loadFormData, []);

    // update form data state
    const _handleChange = (name, value) => {
        setModified(true);
        setData(data => ({ ...data, [name]: value }));
    }

    // cancel form submission
    const _handleCancel = () => {
        setData(null);
        onCancel();
    }

    // handle form reset
    const _handleReset = () => {
        setData({});
        onReset();
    }

    /**
     * Generate form data validation handlers.
     *
     * @private
     * @return {Array} validators
     */

    const _generateValidators = () => {
        return fieldsetSchema
            .reduce((o, fieldset) => {
                Object.keys(fieldset.fields || {})
                    .forEach(fieldkey => {
                        const { name = '', validate = [] } = fieldset.fields[fieldkey];
                        o[name] = new Validator(validate);
                    });
                return o;
            }, {});
    };

    // create validator for each input field using schema settings
    let validators = _generateValidators();

    /**
     * Form data validation handler. Validates all data inputs.
     *
     * @private
     * @return {boolean} isValid
     */

    const _isValid = (formData) => {
        let hasData = allowEmpty;
        let valid = true;
        for (const key in validators) {
            // ensure some data is present
            hasData = hasData || formData[key];
            // check data for validation error
            const err = validators[key].check(formData[key] || null);
            valid = err && Object.keys(err).length > 0 ? false : valid;
            // set error state (invokes validation error message)
            setErrors(errors => ({
                ...errors, [key]: err,
            }));
        }
        return hasData && valid;
    };

    /**
     * Form submission handler.
     *
     * @private
     * @param {Event} e
     */

    const _handleSubmit = e => {
        e.preventDefault();

        // const test = new FormData(e.target);
        // for( let pair of test.entries() ) {
        //     console.log(pair[0]+ ', '+ pair[1]);
        // }

        // check that form is complete and valid
        if (!_isValid(data)) {
            setMessage(data => ({
                ...data, '0': {
                    msg: 'Data was not submitted: Form is incomplete or invalid.',
                    type: 'error',
                }
            })
            );
            return;
        }

        // reset validation message
        setMessage({});

        // get schema form fields
        // - strip out any copied
        const formFields = (schema.fieldsets || []).reduce((o, fset) => {
            o.push.apply(
                o,
                Object.keys(fset.fields).map(key => {
                    const fieldName = extractFieldIndex(key);
                    return fieldName[0];
                })
            )
            return o;
        }, []);

        // convert data through Form Data API
        // - [1] filter data by form schema
        // - [2] reindex copied fields
        // - [3a] append files
        // - [3b] append metadata
        let formData = new FormData();
        let copyIndex = {};
        Object.keys(data)
            // filter fields not in schema
            .filter(key => {
                // strip out copy key
                const fieldName = extractFieldIndex(key);
                // initialize index for each field
                if (fieldName.length > 1) copyIndex[fieldName[0]] = 0;
                // check if field is in schema
                return formFields.includes(fieldName[0]);
            })
            .forEach(key => {
                // reindex copied fields to sequential order
                const fieldName = extractFieldIndex(key);
                const updatedKey = fieldName.length > 1
                    ? `${fieldName[0]}[${copyIndex[fieldName[0]]++}]`
                    : key;

                // append files
                if (data[key] instanceof FileList) {
                    for (let i = 0; i < data[key].length; i++) {
                        const file = data[key][i];
                        // check file format
                        formData.append(updatedKey, file);
                    }
                }
                // append metadata
                else {
                    // handle composite values (i.e. Arrays)
                    if (Array.isArray(data[key])) {
                        // append each subitem separately
                        data[key].forEach((opt, index) => {
                            formData.append(`${updatedKey}[${index}]`, opt.value || opt || '');
                        })
                    }
                    else {
                        formData.append(updatedKey, data[key] || '');
                    }
                }
            });

        // callback for form data submission
        try {
            setDisabled(true);
            return callback(formData)
                .finally(() => {
                    setDisabled(false);
                    _loadFormData();
                });
        } catch (err) {
            console.error(callback, err);
            setMessage(err || defaultError);
        }
    };

    /**
     * Reindex copied fieldset fields by requested copy index.
     * @private
     */

    const _reindexFields = (fields, copyIndex) => {
        return Object.keys(fields).reduce((o, key) => {
            const fieldName = extractFieldIndex(fields[key].name);
            // rewrite the field name with updated copy index
            const updatedKey = `${fieldName[0]}[${copyIndex}]`;
            // update the field with the new name
            // - ensure a deep copy if made of the field object
            o[updatedKey] = JSON.parse(JSON.stringify(fields[key]));
            o[updatedKey].name = updatedKey;
            return o;
        }, {});
    }

    /**
     * Duplicate fieldset in form schema.
     *
     * @private
     * @param {Object} fieldset
     */

    const _handleFieldsetCopy = (fieldset) => {
        try {

            // make separate copy of the template fieldset
            let fieldsetCopy = JSON.parse(JSON.stringify(fieldset));

            // set render type to copy
            fieldsetCopy.render = 'copy';

            // get next copy index based on current number of copies
            const copyIndex = fieldsetSchema.filter(fset => fset.id === fieldset.id).length;

            // update field keys with updated index
            fieldsetCopy.fields = _reindexFields(fieldsetCopy.fields, copyIndex);

            // insert new fieldset into state
            setModified(true);
            setFieldsetSchema(data => (data.reduce((o, fieldset, index) => {
                o.push(fieldset);
                // add the copied fieldset after the index
                if (index === copyIndex - 1) {
                    o.push(fieldsetCopy)
                }
                return o;
            }, [])));

        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Delete fieldset in form.
     *
     * @private
     * @param {Integer} index
     */

    const _handleFieldsetDelete = (index) => {
        try {
            // remove fieldset from schema and reindex fields
            setFieldsetSchema(data => (
                data.filter((fset, idx) => idx !== index)));

        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Render form.
     * - Filter fieldsets rendered as forms
     *
     * @public
     */

    return <>
        {
            <UserMessage message={message} closeable={true} />
        }
        {
            loaded ? <>
                <form
                    id={formID}
                    name={model}
                    method={method}
                    onSubmit={_handleSubmit}
                    onChange={onChange}
                    autoComplete={'chrome-off'}
                >
                    {
                        fieldsetSchema
                            .filter(fieldset => fieldset.render !== 'component')
                            .map((fieldset, index) => {
                                return (
                                    <div key={`${formID}_fieldset_${index}`}>

                                        <Fieldset
                                            formID={formID}
                                            model={model}
                                            index={index}
                                            mode={fieldset.render}
                                            legend={fieldset.legend}
                                            fields={fieldset.fields}
                                            errors={errors}
                                            setErrors={setErrors}
                                            data={data}
                                            onChange={_handleChange}
                                            opts={opts}
                                            remove={(e) => {
                                                e.preventDefault();
                                                _handleFieldsetDelete(index);
                                            }}
                                            isDisabled={isDisabled}
                                            disabledInputs={disabledInputs}
                                            validators={validators}
                                            collapsible={fieldset.collapsible}
                                            open={fieldset.open}
                                        />
                                        {
                                            fieldset.render === 'multiple'
                                            && <div className={'addField'}>
                                                <Button
                                                    key={`${index}_copy_button`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        // send deep copy of fieldset
                                                        _handleFieldsetCopy(fieldset);
                                                    }}
                                                    label={`Add ${fieldset.legend}`}
                                                    icon={'add'}
                                                />
                                            </div>
                                        }
                                    </div>
                                );
                            })
                    }
                    {children}
                    {
                        Object.keys(messages).map(key => {
                            const { type = '' } = messages[key] || {};
                            return <Message
                                key={`${formID}_message_${key}`}
                                timeout={true}
                                message={messages[key]}
                                icon={type}
                                closeable={false}
                            />
                        })
                    }
                    <Submit
                        model={model}
                        label={submit}
                        icon={view}
                        disabled={isDisabled}
                        onSubmit={submit}
                        onCancel={_handleCancel}
                        onReset={_handleReset}
                    />
                </form>
                {
                    // include fieldsets for any attached components
                    fieldsetSchema
                        .filter(fieldset => fieldset.render === 'component')
                        .map((fieldset, index) => {
                            return (
                                <div key={`${formID}_${model}_fieldset_component_${index}`}>
                                    <Fieldset
                                        formID={formID}
                                        model={model}
                                        index={index}
                                        mode={fieldset.render}
                                        legend={fieldset.legend}
                                        fields={fieldset.fields}
                                        errors={errors}
                                        setErrors={setErrors}
                                        data={data || {}}
                                        onChange={_handleChange}
                                        opts={opts}
                                        isDisabled={isDisabled}
                                        disabledInputs={disabledInputs}
                                        validators={validators}
                                        collapsible={fieldset.collapsible}
                                        open={fieldset.open}
                                    />
                                </div>
                            );
                        })
                }
            </>
                : <Loading label={'Loading...'} />
        }
    </>;
};

export default Form;
