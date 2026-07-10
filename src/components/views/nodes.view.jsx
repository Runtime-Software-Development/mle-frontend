/*!
 * MLE.Client.Components.Views.Nodes
 * File: nodes.view.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

import React from 'react';
import {useRouter} from "../../providers/router.provider.client";
import {createNodeRoute, redirect} from "../../utils/paths.utils.client";
import {useData} from "../../providers/data.provider.client";
import {genID, groupBy, sorter} from "../../utils/data.utils.client";
import Carousel from "../common/carousel";
import Comparator from "../common/comparator";
import {getDependentTypes, getModelLabel} from "../../services/schema.services.client";
import Accordion from "../common/accordion";
import MetadataView from "./metadata.view";
import Tabs from "../common/tabs";
import NodeSelector from "../selectors/node.selector";
import Loading from "../common/loading";
import {useDialog} from "../../providers/dialog.provider.client";
import Button from "../common/button";
import EditorMenu from "../menus/editor.menu";
import {MapFeaturesView} from "./maps.view";

// generate unique ID value for form inputs
const menuID = genID();

const getComparisonModernCaptures = (attachedData = {}) => {
    const comparisons = Array.isArray(attachedData?.comparisons) ? attachedData.comparisons : [];
    const captures = comparisons
        .map(item => item?.modern_captures)
        .filter(Boolean);

    // de-duplicate captures by node id
    const seen = new Set();
    return captures.filter(capture => {
        const captureId = capture?.node?.id || capture?.id;
        if (!captureId || seen.has(captureId)) return false;
        seen.add(captureId);
        return true;
    });
};

/**
 * Link to metadata details of node and dependents
 *
 * @public
 * @param {String} id
 * @param {String} model
 * @param {Object} metadata
 * @param label
 * @param attached
 * @param files
 * @param callback
 * @return {JSX.Element}
 */

export const NodeTags = ({
                             id,
                             model,
                             metadata = null,
                             label='',
                             attached={},
                             files={},
                             callback=()=>{},
                         }) => {

    const dialog = useDialog();

    // get full model label
    const modelLabel = getModelLabel(model);

    // handle dialog view
    // - sets node data in provider to load in dialog view
    const _handleDialog = (dialogID) => {
        dialog.setCurrent({
            dialogID: dialogID,
            id: id,
            model: model,
            metadata: metadata,
            attached: attached,
            files: files,
            callback: callback
        });
    };

    return <div className={`h-menu linked-nodes`}>
        <ul>
            {
                id && model && metadata &&
                <li key={`${menuID}_node_menuitem_show`}>
                    <Button
                        icon={'show'}
                        label={`${modelLabel} Metadata`}
                        title={`View ${label} (${modelLabel}) details.`}
                        onClick={() => {
                            _handleDialog('show')
                        }}
                    />
                </li>
            }
            {
                // redirect to node page
                model && id &&
                <li key={`${menuID}_node_menuitem_redirect`}>
                    <Button
                        icon={'externalLink'}
                        label={`View ${modelLabel}`}
                        title={`Redirect to ${label} (${modelLabel}) page.`}
                        onClick={() => { redirect(createNodeRoute(model, 'show', id)) }}
                    />
                </li>
            }
        </ul>
    </div>;
};

/**
 * Default view component for model data.
 *
 * @public
 * @param {Object} data
 * @param {String} model
 * @return {JSX.Element}
 */

const NodesView = ({model, data}) => {

    // create dynamic data states
    const [loadedData, setLoadedData] = React.useState(null);
    const [loadedAttached, setLoadedAttached] = React.useState(null);
    const [error, setError] = React.useState(null);
    const _isMounted = React.useRef(true);

    const router = useRouter();
    const api = useData();

    // destructure node data
    const {
        id='',
        hasDependents = false,
        dependents = [],
        files = [],
        metadata = {},
        attached = {},
        node = {},
    } = api.destructure(data) || {};

    const effectiveAttached = loadedAttached || attached || {};
    const resolvedModel = model || node?.type || '';
    const normalizedModel = String(resolvedModel || '').toLowerCase();
    const isStationModel = normalizedModel === 'stations' || normalizedModel === 'station';

    // infer dependents from schema as API flags may be omitted
    const schemaDependents = getDependentTypes(resolvedModel) || getDependentTypes(`${resolvedModel}s`) || [];
    const canLoadDependents = hasDependents || (Array.isArray(schemaDependents) && schemaDependents.length > 0);

    // set preference tab ID
    const prefTabKey = `pref_tab_${model}_${id}`;

    // normalize dependent payloads (API may return null while marking hasDependents=true)
    const initialDependents = Array.isArray(dependents) ? dependents : [];
    const hasInitialComparisons = isStationModel
        && attached.hasOwnProperty('comparisons')
        && Object.keys(attached.comparisons || {}).length > 0;
    const needsStationComparisons = isStationModel && !hasInitialComparisons;

    // check if dependents data needs to be loaded
    const loadDependents = (canLoadDependents || isStationModel)
        && (initialDependents.length === 0 || needsStationComparisons)
        && !loadedData;

    // API call to retrieve dependents node data (if not yet loaded)
    React.useEffect(() => {
        _isMounted.current = true;

        // extract node ID
        const nodeID = node?.id || id || null;

        // API call for page data
        if (!error && loadDependents) {
            const primaryRoute = createNodeRoute(resolvedModel || 'nodes', 'show', nodeID);
            const fallbackRoute = createNodeRoute('nodes', 'show', nodeID);

            const fetchNodeData = (route) => router.get(route)
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {
                        if (res.error) throw new Error(res.error);
                        const { response = {} } = res || {};
                        const { data = {} } = response || {};
                        const deps = Array.isArray(data?.dependents) ? data.dependents : [];
                        const comparisonCaptures = getComparisonModernCaptures(data?.attached || {});
                        const mergedDeps = deps.length > 0 || comparisonCaptures.length === 0
                            ? deps
                            : comparisonCaptures;
                        setLoadedAttached(data?.attached || null);
                        setLoadedData(mergedDeps);
                    }
                });

            fetchNodeData(primaryRoute)
                .catch(fetchError => {
                    if ((primaryRoute !== fallbackRoute) && _isMounted.current) {
                        return fetchNodeData(fallbackRoute);
                    }
                    throw fetchError;
                })
                .catch(err => {
                    console.error(err);
                    setError(true);
                });
        }
        return () => {
            _isMounted.current = false;
        };
    }, [node, id, model, router, setLoadedData, loadDependents, error]);

    // group dependent nodes by model type
    const comparisonCaptures = getComparisonModernCaptures(effectiveAttached || {});
    const currentDependents = Array.isArray(loadedData)
        ? loadedData
        : initialDependents.length > 0
            ? initialDependents
            : comparisonCaptures;
    const normalizedDependents = currentDependents.map(item => ({
        ...(item || {}),
        type: item?.type || item?.model || item?.node?.type || item?.file?.file_type || ''
    }));
    const dependentsGrouped = groupBy(normalizedDependents, 'type');

    // create tab index of metadata and files
    let _tabItems = [];

    // collect any unsorted captures
    let unsorted = [];

    // add sorted modern captures tabbed items
    if (dependentsGrouped.hasOwnProperty('modern_captures')) {
        // filter unsorted captures
        unsorted.push(...dependentsGrouped.modern_captures.filter(capture => {
            return capture.status === 'unsorted'
        }));
        // filter sorted captures
        const sorted = dependentsGrouped.modern_captures.filter(capture => {
            return capture.status !== 'unsorted'
        });
        if (sorted.length > 0) {
            _tabItems.push({
                label: 'Modern Captures',
                data: <Carousel items={sorted.map(item => {
                    const {
                        id = '',
                        node={},
                        owner = {},
                        refImage={},
                        type = '',
                        label = '',
                        metadata = {}
                    } = api.destructure(item) || {};
                    const {url={}} = refImage || {};
                    return {
                        id: id,
                        owner: owner,
                        node: node,
                        model: type,
                        url: url,
                        label: label,
                        metadata: metadata
                    }
                })} />,
            });
        }
    }

    // sort historic captures into sorted/unsorted
    if (dependentsGrouped.hasOwnProperty('historic_captures')) {
        // filter unsorted captures
        unsorted.push(...dependentsGrouped.historic_captures.filter(capture => {
            return capture.status === 'unsorted'
        }));
        // filter sorted captures
        const sorted = dependentsGrouped.historic_captures.filter(capture => {
            return capture.status !== 'unsorted'
        });

        // add sorted historic captures tabbed items
        if (sorted.length > 0) {
            _tabItems.push({
                label: 'Historic Captures',
                data: <Carousel items={sorted.map(item => {
                    const {
                        id = '',
                        owner = {},
                        node = {},
                        refImage={},
                        type = '',
                        label = '',
                        metadata = {}
                    } = api.destructure(item) || {};
                    const {url={}} = refImage || {};
                    return {
                        id: id,
                        node: node,
                        owner: owner,
                        model: type,
                        url: url,
                        label: label,
                        metadata: metadata
                    }
                })} />,
            });
        }
    }

    // include comparisons metadata if:
    // - comparisons exist
    // - for station-level views
    const comparisonImages = effectiveAttached?.comparisons || [];
    const hasComparisons = Array.isArray(comparisonImages)
        ? comparisonImages.length > 0
        : Object.keys(comparisonImages || {}).length > 0;

    if (
        isStationModel
        && hasComparisons
    ) _tabItems.push({
        label: 'Comparisons',
        data: <Comparator images={comparisonImages} />,
    });

    // add tab for any unsorted captures
    if (unsorted.length > 0) {
        _tabItems.push({
            label: 'Unsorted Captures',
            data: <Carousel items={unsorted.map(item => {
                const {
                    id = '',
                    node = {},
                    owner = {},
                    refImage={},
                    type = '',
                    label = '',
                    metadata = {}
                } = api.destructure(item) || {};
                const {url={}} = refImage || {};
                return {
                    id: id,
                    node: node,
                    owner: owner,
                    model: type,
                    url: url,
                    label: label,
                    metadata: metadata
                }
            })} />,
        });
    }

    // include other dependent nodes
    const nodelist = Object.keys(dependentsGrouped)
        .filter(key => key !== 'historic_captures' && key !== 'modern_captures')
        .map((key, index) => {
            // - for dependent nodes with single entries, do not include the accordion
            const singleNode = dependentsGrouped[key].length === 1;
            // get tab label
            // Note: relabel 'Locations' tab as 'Modern Captures'
            const tabLabel = getModelLabel(key, 'label');
            return {
                label: tabLabel === 'Locations' ? 'Modern Captures' : tabLabel,
                data: dependentsGrouped[key]
                    .sort(sorter)
                    .map(item => {

                        // get item metadata
                        const {
                            id,
                            type,
                            label,
                            files,
                            hasDependents,
                            metadata,
                            attached
                        } = api.destructure(item);

                        // For multiple dependent nodes, enclose metadata in accordion
                        // - include any attached (supplemental) metadata
                        return singleNode
                            ? <div key={`node_view_${type}_${id}_${index}`}>
                                <NodeSelector model={type} data={item} />
                                <NodeTags
                                    model={type}
                                    id={id}
                                    label={label}
                                    files={files}
                                    metadata={metadata}
                                    attached={attached}
                                />
                            </div>
                            : <Accordion
                                key={id}
                                type={type}
                                label={label}
                                hasDependents={hasDependents}
                                menu={
                                    <EditorMenu
                                        model={type}
                                        id={id}
                                        node={node}
                                        metadata={metadata}
                                        visible={['show', 'redirect']}
                                    />
                                }
                            >
                                <NodeSelector model={type} data={item} />
                            </Accordion>
                    }),
            };
        });

    // add dependent nodes to tablist
    if (nodelist.length > 0) _tabItems = nodelist.concat(_tabItems);

    // add map boundary tab if any maps are attached to this node
    const attachedMapIds = (attached?.maps || [])
        .map(map => map?.data?.map_features_id)
        .filter(Boolean);

    if (attachedMapIds.length > 0) {
        _tabItems.push({
            label: 'Maps',
            data: <>
                {attachedMapIds.map(mapId => (
                    <MapFeaturesView
                        key={`map_features_${mapId}`}
                        map_features_id={mapId}
                    />
                ))}
            </>
        });
    }

    // add metadata tab for current node
    // - place attached metadata and supplementary files in same tab
    if (_tabItems.length > 1) _tabItems.push({
        label: `${getModelLabel(model)} Details`,
        data: <MetadataView
                key={`${model}_${node.id}`}
                node={node}
                model={model}
                metadata={metadata}
                attached={attached}
                files={files}
            />
    });

    // Show loading only while an async dependent fetch is actually in-flight.
    // If the fetch returns no dependents, fall back to details instead of spinning forever.
    const isLoadingDependents = canLoadDependents && loadDependents && loadedData === null && !error;

    // if dependents exist, show dependent data in tab, otherwise show metadata details
    // - single dependent shown as simple node view
    // - multiple dependents shown in secondary tab view
    return <>
        {
            canLoadDependents
            ? _tabItems.length > 0
                ? <Tabs prefKey={prefTabKey} className={'nodes'} items={_tabItems} orientation={'horizontal'}/>
                : isLoadingDependents
                    ? <Loading/>
                    : <>
                        {attachedMapIds.map(mapId => (
                            <MapFeaturesView
                                key={`map_features_${mapId}`}
                                map_features_id={mapId}
                            />
                        ))}
                        <MetadataView
                            key={prefTabKey}
                            metadata={metadata}
                            model={model}
                            node={node}
                            attached={attached}
                            files={files}
                        />
                      </>
            : <>
                {attachedMapIds.map(mapId => (
                    <MapFeaturesView
                        key={`map_features_${mapId}`}
                        map_features_id={mapId}
                    />
                ))}
                <MetadataView
                    key={prefTabKey}
                    metadata={metadata}
                    model={model}
                    node={node}
                    attached={attached}
                    files={files}
                />
              </>
        }
        </>

};

export default NodesView;