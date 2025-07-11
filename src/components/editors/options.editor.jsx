/*!
 * MLE.Client.Components.Editors.Options
 * File: options.editor.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import { getModelLabel } from '../../services/schema.services.client';
import { createNodeRoute } from '../../utils/paths.utils.client';
import { useRouter } from '../../providers/router.provider.client';
import Table from '../common/table';
import InputSelector from '../selectors/input.selector';
import Button from '../common/button';
import EditorMenu from "../menus/editor.menu";

/**
 * Render global metadata options editor component.
 * - initialized with global options API data
 * - additions/edits/deletions in the dialog are refreshed in the
 *   global options state after closing.
 *
 * @public
 */

const OptionsEditor = ({type='options', onCancel=()=>{}}) => {

    const router = useRouter();
    const _isMounted = React.useRef(false);

    // initialize option data
    const [options, setOptions] = React.useState({});
    const [selectedIDs, setSelectedIDs] = React.useState({});
    const [optionData, setOptionData] = React.useState({});
    const excludedOpts = ['image_states', 'surveyors', 'surveys', 'survey_seasons', 'statuses', 'map_objects'];
    const [loaded, setLoaded] = React.useState(false);

    // generate unique ID value for form inputs
    const menuID = Math.random().toString(16).substring(2);

    /**
     * Refresh available options from API on load.
     *
     * @public
     * @param optType
     * @param uri
     */

    React.useEffect(() => {
        _isMounted.current = true;
        router.get(`/${type}`)
            .then(res => {
                if (_isMounted.current) {
                    // destructure API data for options
                    const { response = {} } = res || {};
                    const { data = {} } = response || {};
                    setOptions(data);
                    setLoaded(true);
                }
            })
            .catch(err => console.error(err));
        return ()=>{_isMounted.current = false}
    }, [router, type]);

    /**
     * Refresh data state.
     *
     * @public
     * @param optType
     * @param uri
     */

    const _refresh = (optType, uri) => {
        router.get(uri)
            .then(res => {
                // destructure API data for options
                const { response = {} } = res || {};
                const { data = {}, } = response || {};
                setOptionData(optData => ({...optData, [optType]: data}));
            })
            .catch(err => console.error(err));
    }

    /**
     * Input on-change handler. Updates references state.
     *
     * @public
     * @param {Object} e
     */

    const _handleChange = e => {
        const {target={}} = e || {};
        const { name='', value='' } = target;
        e.persist();

        // update state of option selection
        setSelectedIDs(data => ({...data, [name]: value}));

        // get option data from selected ID
        const {id=''} = options.hasOwnProperty(name)
            ? options[name].find(opt => String(opt.value) === String(value)) || {}
            : {};

        // refresh data
        _refresh(name, createNodeRoute(name, 'show', id));
    }

    // filter options for table rows
    const _filterRows = () => {
        return Object.keys(options)
            .filter(optType => !excludedOpts.includes(optType))
            .map(optType => {
                // get selected option ID
                const selectedOptionData = optionData.hasOwnProperty(optType) ? optionData[optType] : {};
                const { id='' } =  selectedOptionData || {};
                const selected = selectedIDs.hasOwnProperty(optType) ? selectedIDs[optType] : '';
                return {
                    option: getModelLabel(optType),
                    select: <InputSelector
                        value={selected || ''}
                        id={`${menuID}_select`}
                        name={optType}
                        options={options[optType]}
                        type={'select'}
                        onChange={_handleChange}
                    />,
                    edit:   <EditorMenu
                        id={id}
                        model={optType}
                        metadata={selectedOptionData}
                        label={getModelLabel(optType)}
                    />
                };
            });
    }

    // table rows, columns
    const rows = _filterRows();
    const cols = [
        { name: 'option', label: 'Option' },
        { name: 'select', label: 'Select to Edit Option', className:'options_select' },
        { name: 'edit', label: '' }
    ];

    return (
            loaded && <>
                <Table className={'options'} rows={rows} cols={cols}/>
                <div className={'right-aligned'}>
                    <Button className={'cancel'} label={'Cancel'} onClick={onCancel}/>
                </div>
            </>
    )
}

export default React.memo(OptionsEditor);
