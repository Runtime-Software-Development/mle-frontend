/*!
 * MLE.Client.Components.Views.Metadata
 * File: metadata.view.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * View component for node metadata.
 *
 * ---------
 * Revisions
 * - 22-07-2023 Refactored out the participants view
 */

import {genSchema} from '../../services/schema.services.client';
import {genID, sanitize} from '../../utils/data.utils.client';
import {useData} from '../../providers/data.provider.client';
import {useUser} from '../../providers/user.provider.client';
import FilesView from "./files.view";
import {AttachedMetadataView} from "./attached.view";
import Accordion from '../common/accordion';

// generate random key
const keyID = genID();

const normalizeJSONValue = (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return value;
    try {
        return JSON.parse(trimmed);
    } catch {
        return value;
    }
};

const summarizeJSONValue = (value) => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return `Array (${value.length} items)`;
    if (typeof value === 'object') return `Object (${Object.keys(value).length} fields)`;
    return 'Value';
};

const formatPreviewValue = (value) => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return `Array (${value.length})`;
    if (typeof value === 'object') return `Object (${Object.keys(value).length})`;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    const text = String(value);
    return text.length > 80 ? `${text.slice(0, 77)}...` : text;
};

const ReadableJSONView = ({value}) => {
    const normalized = normalizeJSONValue(value);
    const isStructured = normalized !== null && typeof normalized === 'object';
    const summary = summarizeJSONValue(normalized);
    const topLevel = isStructured
        ? Array.isArray(normalized)
            ? normalized.map((item, index) => [String(index), item])
            : Object.entries(normalized)
        : [];
    const pretty = isStructured
        ? JSON.stringify(normalized, null, 2)
        : String(normalized ?? '');

    return (
        <Accordion
            className={'metadata-json'}
            label={`JSON (${summary})`}
            open={false}
        >
            {
                topLevel.length > 0 &&
                <table className={'metadata-json-summary'}>
                    <thead>
                    <tr>
                        <th>Key</th>
                        <th>Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        topLevel.map(([key, item]) => {
                            return <tr key={`json_preview_${keyID}_${key}`}>
                                <th>{key}</th>
                                <td>{formatPreviewValue(item)}</td>
                            </tr>
                        })
                    }
                    </tbody>
                </table>
            }
            <pre className={'metadata-json-pre'} aria-label={'JSON Object'}>{pretty}</pre>
        </Accordion>
    );
};

/**
 * Render item metadata (and attached metadata, files) as table component.
 *
 * @public
 * @param {String} model
 * @param {Object} metadata
 * @param {Object} node
 * @param {Object} file
 * @param {Object} attached
 * @param {Object} files
 * @return {JSX.Element}
 */

const MetadataView = ({
                          model,
                          metadata = {},
                          node = {},
                          file = {},
                          attached={},
                          files={}
                      }) => {

    const api = useData();
    const user = useUser();

    // generate the model schema
    const { fieldsets = [] } = genSchema({
        view: 'show',
        model: model,
        user: user
    });

    // prepare data for item table: sanitize data by render type
    const filterData = (fieldset) => {
        return Object.keys(fieldset.fields)
            .filter(key => {
                // omit hidden fields
                const { render = '' } = fieldset.fields[key] || {};
                return render !== 'hidden';
            })
            .map(fieldKey => {
                // get rendering setting from schema (if exists)
                const { render = '', reference = '', attributes = {} } = fieldset.fields[fieldKey] || {};
                const { prefix = '', suffix = '' } = attributes || {};

                // cascade data sources
                let value = (metadata || {}).hasOwnProperty(fieldKey)
                    ? metadata[fieldKey]
                    : file.hasOwnProperty(fieldKey)
                        ? file[fieldKey]
                        : node.hasOwnProperty(fieldKey)
                            ? node[fieldKey]
                            : '';

                // select option label for display (if found for given value)
                if (render === 'select' && api.options.hasOwnProperty(reference)) {
                    const selected = api.options[reference].find(opt => String(opt.value) === String(value))
                    value = selected ? selected.label : value;
                }

                // map features are now rendered in a dedicated tab in NodesView;
                // skip rendering in the metadata table to avoid duplication.
                if (render === 'mapFeature') {
                    return { value: null, label: null };
                }

                if (render === 'json' && value !== null && String(value) !== '') {
                    return {
                        value: <ReadableJSONView value={value} />,
                        label: fieldset.fields[fieldKey].label,
                    };
                }

                // multiselect list of values (if available)
                if (render === 'multiselect' && metadata.hasOwnProperty(fieldKey) && Array.isArray(metadata[fieldKey].data)) {
                    return {
                        value: <ul className={'list'}>
                            {
                                metadata[fieldKey].data.map((item, index) => {
                                    const { label = '', created_at='', updated_at='' } = item || {};
                                    return <li
                                        key={`${keyID}_metadata_${genID()}_${model}_${index}`}
                                        title={`Created: ${sanitize(created_at, 'timestamp')}
                                        Last Modified: ${sanitize(updated_at, 'timestamp')}`}
                                    >{sanitize(label)}</li>;
                                })
                            }
                        </ul>,
                        label: fieldset.fields[fieldKey].label,
                    };
                }

                return {
                    value: sanitize(value, render, '', '', prefix, suffix),
                    label: fieldset.fields[fieldKey].label,
                };
            });
    };

    return <>
        {
            fieldsets
                .map((fieldset, index) => {
                    return <table key={`${keyID}_${index}`} className={'item'}>
                        <thead>
                        <tr>
                            <th colSpan={'2'}>{fieldset.legend}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            filterData(fieldset)
                                .filter(field => field.label !== null)
                                .map((field, index) => {
                                return (
                                    <tr key={`${keyID}_tr_${index}`}>
                                        <th>{field.label}</th>
                                        <td>{field.value}</td>
                                    </tr>
                                );
                            })
                        }
                        </tbody>
                    </table>;
                })
        }
        {
            Object.keys(attached || {}).length > 0 &&
            <AttachedMetadataView owner={node} attached={attached} />
        }
        {
            Object.keys(files || {}).length > 0 &&
            <FilesView key={`files_${model}_${node.id}`} owner={node} files={files} />
        }
        { (Object.keys(node).length > 0 || Object.keys(file).length > 0) &&
        <div style={{padding: '10px'}} className={'subtext'}>
            <table key={`${keyID}_node_metadata`}>
                <tbody>
                <tr>
                    <th>Created</th>
                    <td>{sanitize(node?.created_at || file?.created_at || metadata?.created_at, 'datetime')}</td>
                </tr>
                <tr>
                    <th>Last Modified</th>
                    <td>{sanitize(node?.updated_at || file?.updated_at || metadata?.updated_at, 'datetime')}</td>
                </tr>
                </tbody>
            </table>
        </div>
        }
    </>;
};

export default MetadataView;
