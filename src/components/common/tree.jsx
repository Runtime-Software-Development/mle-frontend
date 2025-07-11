/*!
 * MLE.Client.Components.Common.Tree
 * File: tree.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Node tree (list) component. Expandable node tree menu.
 *
 * ---------
 * Revisions
 */

import React from 'react'
import {useRouter} from '../../providers/router.provider.client';
import {useData} from '../../providers/data.provider.client';
import {createNodeRoute} from '../../utils/paths.utils.client';
import {getModelLabel, getNodeOrder } from '../../services/schema.services.client';
import Button from '../common/button';
import {sorter} from '../../utils/data.utils.client';
import Loading from '../common/loading';
import Accordion from "../common/accordion";
import {useNav} from "../../providers/nav.provider.client";
import {useWindowSize} from "../../utils/events.utils.client";
import styles from '../styles/tree.module.css';

/**
 * Navigation tree node component.
 *
 * @public
 * @param {Object} item
 */

const TreeNode = ({data, depth, maxdepth, callback=()=>{}}) => {

    // destructure node data
    const {
        type='',
        id='',
        label='',
        hasDependents=false
    } = data || {};

    // create dynamic data states
    const [toggle, setToggle] = React.useState(false);
    const [selected, setSelected] = React.useState(false);
    const [loadedData, setLoadedData] = React.useState(null);
    const [error, setError] = React.useState(null);
    const treeNode = React.createRef();
    const _isMounted = React.useRef(true);

    // initialization
    const router = useRouter();
    const api = useData();

    // get full model label
    const modelLabel = getModelLabel(type);

    // handle toggle events
    const _handleToggle = () => {
        // open collapsible
        setToggle(!toggle);
    }

    // handle select events
    const _handleSelect = () => {
        callback(type, id);
        setSelected(!selected);
    }

    // toggle button classnames
    const classnames = [
        'tree-node',
        hasDependents ? 'toggle' : 'leaf'
    ];

    // API call to retrieve node data (if not yet loaded)
    React.useEffect(() => {
        _isMounted.current = true;

        // load tree node data
        if (!error && hasDependents && toggle && !loadedData) {
            const route = createNodeRoute('nodes', 'show', id);
            router.get(route)
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {

                        if (res.error) return setError(res.error);

                        // destructure any available dependent nodes
                        const {response = {}} = res || {};
                        let {data = {}} = response || {};
                        const {dependents = []} = data || {};

                        // separate sorted from unsorted captures or non-capture nodes
                        const unsorted = dependents.filter(item => {
                            const { node = {}, status = '' } = item || {};
                            const {type = ''} = node || {};
                            return ( type === 'historic_captures' || type === 'modern_captures' ) && (status === 'unsorted')
                        });
                        const sorted = dependents.filter(item => {
                            const { node = {}, status = '' } = item || {};
                            const {type = ''} = node || {};
                            return ( type !== 'historic_captures' && type !== 'modern_captures' ) || status !== 'unsorted'
                        });

                        // store separate properties to accommodate sorted/unsorted captures
                        setLoadedData({
                            sorted: sorted,
                            unsorted: unsorted
                        });
                    }
                })
                .catch(err => console.error(err)
                );
        }
        return () => {
            _isMounted.current = false;
        };
    }, [
        api,
        router,
        id,
        hasDependents,
        toggle,
        treeNode,
        loadedData,
        setLoadedData,
        error
    ]);

    return (
        <>
            <div id={`treenode_${id}`} ref={treeNode} className={`tree-node ${selected ? styles.active : styles.inactive}`}>
                <div className={'h-menu'}>
                    <ul>
                        <li>
                            <Button
                                icon={hasDependents ? (toggle ? 'collapse' : 'expand') : 'empty'}
                                className={classnames.join(' ')}
                                title={`Expand ${label}.`}
                                onClick={hasDependents ? _handleToggle : () => {}}
                            />
                        </li>
                        <li>
                            <Button icon={type} size={'lg'} className={'tree-node-icon'} />
                        </li>
                        <li>
                            <Button
                                label={label}
                                size={'sm'}
                                className={`tree-node-label`}
                                title={`View ${modelLabel}: ${label}`}
                                onClick={_handleSelect}
                            />
                        </li>
                    </ul>
                </div>
                {
                    // toggle dependent nodes list
                    toggle && hasDependents
                        ? error
                            ? <Button className={'msg error'} label={'An error occurred'} icon={'error'}/>
                            : loadedData
                                ?   <>
                                    <TreeNodeList depth={depth} maxdepth={maxdepth} items={loadedData.sorted} />
                                    {
                                        loadedData.unsorted.length > 0 &&
                                        <ul>
                                            <li>
                                                <Accordion
                                                    className={'tree-node-unsorted unsorted'}
                                                    type={'historic_captures'}
                                                    label={'Unsorted Captures'}
                                                >
                                                    <TreeNodeList depth={depth} maxdepth={maxdepth} items={loadedData.unsorted} />
                                                </Accordion>
                                            </li>
                                        </ul>
                                    }
                                </>
                                : <Loading/>
                        : <></>
                }
            </div>
        </>
    );
}

/**
 * Navigation tree node list component.
 * - Discovers appropriate menu label text using schema
 * - Sorts node items: (1) Node order; (2) Alphabetically by label
 *
 * @public
 */

const TreeNodeList = ({items, maxdepth, depth, callback}) => {
    depth += 1;
    return maxdepth > depth && <ul>
        {
            // return sorted nodes
            items
                .map(item => {
                    const {
                        node = {},
                        file = {},
                        hasDependents = false,
                        status = '',
                        label = '',
                        metadata = {},
                        refImage = {},
                        attached = {}
                    } = item || {};
                    const {id = '', type = '', owner_id = '', owner_type = ''} = node || {};
                    const {file_size = 0, mimetype = '', filename = ''} = file || {};
                    const {url = ''} = refImage || {};
                    let itemMetadata = metadata || {};
                    // include file metadata in details
                    itemMetadata.filename = filename;
                    itemMetadata.file_size = file_size;
                    itemMetadata.mimetype = mimetype;
                    return {
                        type: type,
                        id: id,
                        label: label,
                        node: node,
                        order: getNodeOrder(type || '') || 0,
                        hasDependents: hasDependents,
                        status: status,
                        metadata: itemMetadata,
                        url: url,
                        attached: attached,
                        owner: {type: owner_type, id: owner_id}
                    }
                })
                // sort alphabetically / numerically
                .sort(sorter)
                // sort by node order
                .sort(function (a, b) {
                    return a.order - b.order;
                })
                .map(item => {
                    return (
                        <li key={`tree_node_${item.id}`}>
                            <TreeNode depth={depth} maxdepth={maxdepth} data={item} callback={callback} />
                        </li>
                    )
                })
        }
    </ul>;
}

/**
 * Node Tree component.
 *
 * @public
 *
 * @return
 */

const Tree = ({hidden, depth=1, callback=()=>{}}) => {

    const nav = useNav();
    const treeRef = React.useRef();

    // window dimensions
    const [, winHeight] = useWindowSize();

    console.log('Tree data:', nav.tree)

    return <>
        {
            nav.tree && Object.keys(nav.tree).length > 0
                ? <div
                    ref={treeRef}
                    className={'tree'}
                    style={{
                        display: hidden ? ' none' : ' block',
                        height: (winHeight - 140) + 'px'
                    }}
                >
                    <div className={'root'}>
                        {
                            Object.keys(nav.tree)
                                .map((key, index) => {
                                    return (
                                        <Accordion
                                            key={`nav_tree_item__${key}_${index}`}
                                            type={key}
                                            label={getModelLabel(key, 'label')}
                                            open={true}
                                        >
                                            <TreeNodeList
                                                depth={0}
                                                maxdepth={depth}
                                                items={nav.tree[key]}
                                                filter={nav.filter}
                                                callback={callback}
                                            />
                                        </Accordion>
                                    )
                                })
                        }
                    </div>
                </div>
                : <Loading overlay={true}/>
        }
    </>
}

export default React.memo(Tree)