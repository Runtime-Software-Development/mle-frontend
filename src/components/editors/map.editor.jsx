/*!
 * MLE.Client.Components.Editors.MapFeatures
 * File: map.editor.js
 * Copyright(c) 2024 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import InputSelector from "../selectors/input.selector";
import {UserMessage} from "../common/message";
import {useData} from "../../providers/data.provider.client";
import {useRouter} from "../../providers/router.provider.client";
import styles from "../styles/mapfeatures.module.css";
import Icon from "../common/icon";
import Button from "../common/button";
import Table from "../common/table";
import Badge from "../common/badge";
import {useDialog} from "../../providers/dialog.provider.client";


/**
 * Map feature selector and editor widget. Used to edit dependent features in map.
 *
 * @public
 * @param {integer} id
 * @return {JSX.Element}
 */

export const MapEditor = ({id}) => {

    const api = useData();
    const router = useRouter();
    const dialog = useDialog();

    const _isMounted = React.useRef(true);

    // create dynamic data states
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [selectedFeatures, setSelectedFeatures] = React.useState([]);
    const [message, setMessage] = React.useState(null);

    // map features data
    const [loadedData, setLoadedData] = React.useState(null);

    // prepare image table columns
    const cols = [
        {name: 'check', label: ''},
        {name: 'name', label: 'Name'},
        {name: 'typeLabel', label: 'Type'},
        {name: 'map_object', label: 'Map Object'},
        {name: 'description', label: 'Description'}
    ];

    // update selected image file for canvas loading
    const _handleChange = (e) => {

        // reset error message
        setMessage(null);

        // reject empty file list
        if (!e.target) return;

        // Get requested target data
        const { target = {} } = e || {};

        // include local file for upload
        setSelectedFile(target.value)
    };

    /**
     * Flatten feature array to collect feature node IDs
     * @param features
     * @private
     */
    const _getFeatureIDs = (features) => {
        return [].concat.apply([], features).map(({nodes_id}) => {return nodes_id});
    }

    /**
     * Flatten map features array for selection
     * @param features
     * @private
     */
    const _getFeatureList = (features) => {
        return [].concat.apply([], features)
            .map(feature => {
                const {nodes_id, owner, name, type, description, geometry} = feature || {};
                // select map feature type label (if available)
                const {map_feature_types = []} = api.options || {};
                // select image state label for value (if available)
                const mapFeatureType = map_feature_types.find(opt => opt.value === type) || {};
                return {
                    className: selectedFeatures.includes(nodes_id) ? styles.active : styles.inactive,
                    onClick: () => {_handleSelect(nodes_id)},
                    id: nodes_id,
                    check: <Icon type={selectedFeatures.includes(nodes_id) ? 'success' : 'cancel'} />,
                    name: name,
                    map_object: owner.name || '',
                    type: type || '',
                    typeLabel: mapFeatureType.label || '',
                    description: description,
                    geometry: geometry
                }
            });
    }

    // convert map features data to selectable options
    const featureOptions = {
        features: _getFeatureList(loadedData),
        data: _getFeatureIDs(loadedData) || [],
    }

    const _handleClose = () => {

        dialog.clear();
    }

    const _handleExtract = () => {

        return router.get(`/files/map/features/${selectedFile}`)
            .then(res => {
                // update state with response data
                if (_isMounted.current) {
                    if (res.error) return setMessage(res.error);
                    const { response = {} } = res || {};
                    const { data = {} } = response || {};
                    setLoadedData(data);
                }
            })
            .catch(err => console.error(err),
            );
    }

    // handle submit of filtered map features
    const _handleSubmit = () => {

        const features = (selectedFeatures || []).map((selectedID) => {
            const feature = featureOptions.features.find(feature => feature.id === selectedID);
            const {name, description, type, geometry} = feature || {};
            return {name, geometry, type, description};
        });

        router.post(`/files/map/features/${id}`, features, true)
            .then(res => {
                // update state with response data
                if (_isMounted.current) {
                    if (res.error) return setMessage(res.error);
                    const { response = {} } = res || {};
                    const { message = {} } = response || {};
                    setMessage(message)
                }
            })
            .catch(err => console.error(err),
            );
    }

    /**
     * Handler to reset map objects selection
     * @private
     */
    const _handleResetFile = () => {
        setSelectedFile('');
    };

    /**
     * Handler to reset map objects selection
     * @private
     */
    const _handleReset = () => {
        setSelectedFeatures([]);
    };

    /**
     * Handler for image download selection
     *
     * @param id
     * @private
     */
    const _handleSelect = (id) => {
        // toggle inclusion of selected id
        selectedFeatures.includes(id)
            ? setSelectedFeatures(data => {return data.filter(o => o !== id)})
            : setSelectedFeatures(data => ([ ...data, id ]));
    };

    /**
     * Handler for image download selection
     *
     * @private
     */
    const _handleSelectAll = () => {
        setSelectedFeatures(featureOptions.data);
    };

    const {files} = api.data || {};
    const {metadata_files} = files || {};
    const fileList = (metadata_files || []).map(metadata_file => {
        const {file, label} = metadata_file || {};
        const {id} = file || {};
        return {
            value: id,
            label: `${label}`
        }
    });

    return <>
        {
            fileList.length === 0 && <UserMessage
                message={{ msg: 'No Metadata Files Found', type: 'warning' }}
                closeable={false}
            />
        }
        <InputSelector
            id={'file_selection'}
            name={'file_selection'}
            value={selectedFile}
            type={'select'}
            options={fileList}
            label={'KMZ Metadata File'}
            onChange={_handleChange}
        />
        {
            <div className={'h-menu'}>
                <ul>
                    {
                        selectedFile && <>
                            <li>
                                <Button
                                    icon={'extract'}
                                    className={'submit'}
                                    label={'Extract Map Features'}
                                    onClick={_handleExtract}
                                />
                            </li>

                            <li>
                                <Button
                                    icon={'reset'}
                                    className={'submit'}
                                    label={'Reset'}
                                    onClick={_handleResetFile}
                                />
                            </li>
                        </>
                    }
                    <li>
                        <Button
                            icon={'close'}
                            label={'Close'}
                            className={'submit'}
                            onClick={_handleClose}
                        />
                    </li>

                </ul>
            </div>
        }
        {
            loadedData &&
            <fieldset className={'submit'}>
                <div>
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
                    <Table rows={featureOptions.features} cols={cols} className={`files`} />
                    <Badge
                        className={'active'}
                        label={selectedFeatures.length === 1 ?`${selectedFeatures.length} map object selected.` : `${selectedFeatures.length} map objects selected.`}
                        icon={'map_objects'}
                    />
                    <div className={'h-menu'}>
                        <UserMessage message={message} closeable={true} />
                        <ul>
                            <li>
                                {
                                    Array.isArray(selectedFeatures) && selectedFeatures.length > 0 &&
                                    <>
                                        <Button
                                            icon={'import'}
                                            label={'Extract'}
                                            className={'submit'}
                                            onClick={_handleSubmit}
                                        />
                                        <Button
                                            icon={'close'}
                                            label={'Close'}
                                            className={'submit'}
                                            onClick={_handleClose}
                                        />
                                    </>
                                }
                            </li>
                        </ul>
                    </div>
                </div>
            </fieldset>
        }
    </>
}