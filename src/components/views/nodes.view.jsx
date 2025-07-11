/*!
 * MLE.Client.Components.Views.Nodes
 * File: nodes.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import {useRouter} from "../../providers/router.provider.client";
import {createNodeRoute, redirect} from "../../utils/paths.utils.client";
import {useData} from "../../providers/data.provider.client";
import {genID, groupBy, sorter} from "../../utils/data.utils.client";
import Carousel from "../common/carousel";
import Comparator from "../common/comparator";
import {getModelLabel} from "../../services/schema.services.client";
import Accordion from "../common/accordion";
import MetadataView from "./metadata.view";
import Tabs from "../common/tabs";
import NodeSelector from "../selectors/node.selector";
import Loading from "../common/loading";
import {useDialog} from "../../providers/dialog.provider.client";
import Button from "../common/button";
import EditorMenu from "../menus/editor.menu";

// generate unique ID value for form inputs
const menuID = genID();

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
                        label={`Go to ${modelLabel}`}
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

    // set preference tab ID
    const prefTabKey = `pref_tab_${model}_${id}`;

    // check if dependents data needs to be loaded
    const loadDependents = hasDependents && Array.isArray(dependents) && dependents.length === 0 && !loadedData;

    // API call to retrieve dependents node data (if not yet loaded)
    React.useEffect(() => {
        _isMounted.current = true;

        // extract node ID
        const { id=null } = node || {};

        // API call for page data
        if (!error && loadDependents) {
            const route = createNodeRoute(model, 'show', id);
            router.get(route)
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {
                        if (res.error) return setError(res.error);
                        const { response = {} } = res || {};
                        const { data = {} } = response || {};
                        const { dependents = [] } = data || {};
                        setLoadedData(dependents);
                    }
                })
                .catch(err => console.error(err), setError(true));
        }
        return () => {
            _isMounted.current = false;
        };
    }, [node, model, router, setLoadedData, loadDependents, error]);

    // group dependent nodes by model type
    const dependentsGrouped = groupBy( loadedData ? loadedData || [] : dependents ? dependents : [], 'type');

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
    // - not at station node level
    if (
        model === 'stations'
        && attached.hasOwnProperty('comparisons')
        && Object.keys(attached.comparisons).length > 0
    ) _tabItems.push({
        label: 'Comparisons',
        data: <Comparator images={attached.comparisons} />,
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

    // if dependents exist, show dependent data in tab, otherwise show metadata details
    // - single dependent shown as simple node view
    // - multiple dependents shown in secondary tab view
    return <>
        {
            hasDependents
            ? _tabItems.length > 0
                ? <Tabs prefKey={prefTabKey} className={'nodes'} items={_tabItems} orientation={'horizontal'}/>
                : <Loading/>
            : <MetadataView
                key={prefTabKey}
                metadata={metadata}
                model={model}
                node={node}
                attached={attached}
                files={files}
            />
        }
        </>

};

export default NodesView;