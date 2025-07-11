/*!
 * MLE.Client.Components.Navigator.MapFeatures
 * File: mapfeatures.navigator.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Map features navigator component. Enables map features to overlay on map navigator tool.
 *
 * ---------
 * Revisions

 */

import React from 'react';
import { useNav } from "../../providers/nav.provider.client";
import {useData} from "../../providers/data.provider.client";
import {useDialog} from "../../providers/dialog.provider.client";
import {useRouter} from "../../providers/router.provider.client";
import styles from '../styles/mapfeatures.module.css';
import Table from "../common/table";
import Button from "../common/button";
import Badge from "../common/badge";
import Icon from "../common/icon";
import InputSelector from "./input.selector";
import Accordion from "../common/accordion";

/**
 * Navigator map overlay component.
 *
 * @public
 * @return {JSX.Element}
 */

function MapSelector({callback, single=false, value}) {

    const nav = useNav();
    const api = useData();
    const router = useRouter();
    const dialog = useDialog();

    const _isMounted = React.useRef(true);

    // create dynamic data states
    const [selected, setSelected] = React.useState((nav.overlay || []).map(({id}) => {return id}));

    // map features data
    const [loadedData, setLoadedData] = React.useState(null);
    const [keywordFilter, setKeywordFilter] = React.useState('');
    const [groupFilter, setGroupFilter] = React.useState([]);
    // convert map features data to selectable options
    const [filteredFeatures, setFilteredFeatures] = React.useState([]);
    const [filteredIDs, setFilteredIDs] = React.useState([]);

    // init error state
    const [error, setError] = React.useState(null);

    // prepare image table columns
    const cols = [
        {name: 'check', label: '', sort: true, defaultSort: true},
        {name: 'name', label: 'Name', sort: true},
        {name: 'type', label: 'Type', sort: true},
        {name: 'map_object', label: 'Group (Map Object)', sort: true},
    ];

    // get map objects options
    const { map_objects=[] } = api.options || {};

    /**
     * Handler for multiple map features selection
     *
     * @param id
     * @private
     */
    const _handleSelect = (id) => {
        // toggle inclusion of selected id
        selected.includes(id)
            ? setSelected(data => {return data.filter(o => o !== id)})
            : setSelected(data => ([ ...data, id ]));
    };


    /**
     * Reformat features array for selection table
     * @private
     */
    const _getFeatureList = () => {
        return [].concat.apply([], filteredFeatures)
            .map(feature => {
                const {nodes_id, owner_id, name, type, description, geometry, dependents} = feature || {};
                const {map_feature_types = []} = api.options || {};
                // select image state label for value (if available)
                const mapFeatureType = map_feature_types.find(opt => opt.value === type) || {};
                const mapObject = map_objects.find(opt => opt.value === owner_id) || {};
                return {
                    className: selected.includes(nodes_id) ? styles.active : styles.inactive,
                    onClick: () => {
                        _handleSelect(nodes_id)
                    },
                    id: nodes_id,
                    check: <Icon type={selected.includes(nodes_id) ? 'success' : 'close'} />,
                    name: name,
                    value: nodes_id,
                    label: name,
                    map_object: mapObject.label || '',
                    map_object_id: mapObject.value || '',
                    type: mapFeatureType.label || '',
                    description: description,
                    geometry: geometry,
                    dependents: dependents
                }
            });
    }

    /**
     * Flatten feature array to collect feature node IDs
     * @param features
     * @private
     */
    const _getFeatureIDs = (features) => {
        return [].concat.apply([], features).map(({nodes_id}) => nodes_id);
    }

    // retrieve map features
    // API call to retrieve map features data (if not yet loaded)
    React.useEffect(() => {

        _isMounted.current = true;

        // API call for page data
        // if ID value passed, use file extraction route
        if (!error && !loadedData) {
            router.get('/map/features')
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {
                        if (res.error) return setError(res.error);
                        const { response = {} } = res || {};
                        const { data = {} } = response || {};
                        setLoadedData(data);
                        setFilteredFeatures(data);
                        setFilteredIDs(_getFeatureIDs(data));
                    }
                })
                .catch(err => console.error(err),
                );
        }
    }, [error, loadedData, setLoadedData, router, selected, setSelected, _getFeatureIDs]);


    // handle submit of filtered map features
    const _handleSubmit = () => {
        const selectedFeatures = (selected || []).map((selectedID) => {
            const feature = filteredFeatures.find(feature => feature.nodes_id === selectedID);
            const {owner_id, name, type, description, geometry, dependents} = feature || {};
            const mapObject = map_objects.find(opt => opt.value === owner_id) || {};
            return {
                id: selectedID,
                selected: (selected || []).length === 1,
                geoJSON: geometry.map(featureGeometry => {
                    return {
                        type: 'Feature',
                        geometry: featureGeometry,
                        properties: {
                            name: name,
                            description: description,
                            type: type,
                            owner: mapObject.label || '-',
                            owner_id: owner_id,
                            dependents: dependents
                        }
                    }
                })
            };
        });
        callback(selectedFeatures);
    }

    /**
     * Handler for cancel operation
     * @private
     */
    const _handleCancel = () => {
        dialog.cancel();
    }

    /**
     * Handler to reset map objects selection
     * @private
     */
    const _handleReset = () => {
        setSelected([]);
    };

    /**
     * Handler to reset map objects selection
     * @private
     */
    const _handleClear = () => {
        setSelected([]);
        nav.setOverlay([]);
        dialog.cancel();
    };

    /**
     * Handler for image download selection
     *
     * @private
     */
    const _handleSelectAll = () => {
        setSelected(_getFeatureIDs(filteredFeatures));
    };

    // retrieve map features
    // API call to retrieve map features data (if not yet loaded)
    React.useEffect(() => {

        // split search string into array of terms (remove empty strings)
        const keywords = String(keywordFilter).trim().split(' ').filter(n => n);
        // map feature groups (map objects) into array of node IDs
        const groupIDs = groupFilter.map(({value}) => parseInt(value));

        /**
         * Handler for filtering map feature by keyword in name
         *
         * @private
         * @return Boolean
         * @param {Object} feature
         */
        const _filterByKeyword = (feature) => {
            const {name} = feature || {};
            // create regular expression to test terms in keyword string
            const re = new RegExp((keywords || []).join('|'), "i");
            // test terms against name string
            return (keywords || []).length === 0 || re.test(String(name).toLowerCase());
        };

        /**
         * Handler for filtering map feature by map object
         *
         * @private
         * @return Boolean
         * @param {Object} feature
         */
        const _filterByGroup = (feature) => {
            const {owner_id} = feature || {};
            return (groupIDs || []).length === 0 || (groupIDs || []).includes(parseInt(owner_id));
        };

        // apply user input filters to loaded map feature data
        const filtered = (loadedData || [])
            .filter(_filterByKeyword)
            .filter(_filterByGroup);

        // update filtered data in state
        setFilteredFeatures(filtered);
        setFilteredIDs(filtered.map(({id}) => id));

    }, [loadedData, keywordFilter, groupFilter, setFilteredFeatures, setFilteredIDs]);

    /**
     * Set keyword filter as string; reset selected IDs array
     * @private
     * @param e
     */
    const _handleNameFilter = (e) => {
        const {value} = e.target || {};
        setKeywordFilter(value);
        setSelected([]);
    }

    /**
     * Set selected map objects filter as array; reset selected IDs array
     * @private
     * @param name
     * @param options
     */
    const _handleGroupFilter = (name, options) => {
        setGroupFilter(options);
        setSelected([]);
    }

    return <fieldset className={'submit'}>
        <div>
            <Accordion type={'filter'} label={'Filter Map Features'}>
                <InputSelector
                    id={'map_features_filter'}
                    name={'map_features_filter'}
                    value={keywordFilter}
                    type={'text'}
                    label={'Filter Name By Keyword'}
                    onChange={_handleNameFilter}
                    onSelect={()=>{}}
                />
                <InputSelector
                    key={'filter_map_object'}
                    id={'filter_map_object'}
                    name={'filter_map_object'}
                    type={'multiselect'}
                    value={groupFilter || ''}
                    selected={value || ''}
                    label={'Filter By Feature Group'}
                    options={api.options.map_objects}
                    onMultiselect={_handleGroupFilter}
                />
            </Accordion>
            {
                single ?
                    <InputSelector
                        id={'map_features_id'}
                        name={'map_features_id'}
                        value={value}
                        type={'select'}
                        options={_getFeatureList()}
                        label={'Select a linked Map Feature'}
                        onChange={callback}
                        onSelect={()=>{}}
                    /> :
                    <>

                        <div className={'h-menu'}>
                            <ul>
                                <li>
                                    <Button
                                        icon={'list'}
                                        label={'Select All'}
                                        onClick={_handleSelectAll}
                                    />
                                </li>
                                <li>
                                    <Button
                                        icon={'close'}
                                        label={'Deselect All'}
                                        onClick={_handleReset}
                                    />
                                </li>
                            </ul>
                        </div>
                        <Table rows={_getFeatureList()} cols={cols} className={`files`} />
                        <Badge
                            className={'active'}
                            label={selected.length === 1 ?`${selected.length} map object selected.` : `${selected.length} map objects selected.`}
                            icon={'map_objects'}
                        />
                        <div className={'h-menu'}>
                            <ul>
                                <li>
                                    <Button
                                        icon={Array.isArray(selected) && selected.length > 0 ? 'success' : 'cancel'}
                                        label={Array.isArray(selected) && selected.length > 0 ? 'Select' : 'Clear Selection'}
                                        className={'submit'}
                                        onClick={Array.isArray(selected) && selected.length > 0 ? _handleSubmit : _handleClear}
                                    />
                                </li>
                                <li>
                                    <Button
                                        icon={'cancel'}
                                        label={'Cancel'}
                                        className={'cancel'}
                                        onClick={_handleCancel}
                                    />
                                </li>
                            </ul>

                        </div>
                    </>
            }
        </div>
    </fieldset>;
}
export default MapSelector;