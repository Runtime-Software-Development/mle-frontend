/*!
 * MLE.Client.Components.Navigator.Tree
 * File: tree.navigator.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Tree (list) navigator component. Expandable node tree menu.
 *
 * ---------
 * Revisions
 */

import React from 'react'
import {useRouter} from '../../providers/router.provider.client';
import {useData} from '../../providers/data.provider.client';
import {createNodeRoute} from '../../utils/paths.utils.client';
import {getModelLabel, getNodeOrder, isCaptureType} from '../../services/schema.services.client';
import {addNode, checkNode, removeNode} from '../../services/session.services.client';
import Button from '../common/button';
import {capitalize, sorter} from '../../utils/data.utils.client';
import Loading from '../common/loading';
import Accordion from "../common/accordion";
import {useNav} from "../../providers/nav.provider.client";
import {useWindowSize} from "../../utils/events.utils.client";
import EditorMenu from "../menus/editor.menu";
import {useUser} from "../../providers/user.provider.client";
import {useDialog} from "../../providers/dialog.provider.client";
import Image from "../common/image";

/**
 * Navigation tree node component.
 *
 * @public
 * @param {Object} item
 */

const TreeNode = ({data}) => {

    // destructure node data
    const {
        type='',
        id='',
        node={},
        label='',
        hasDependents=false,
        status='',
        metadata=null,
        attached=null,
        owner=null,
        url=null
    } = data || {};

    // create dynamic data states
    const [toggle, setToggle] = React.useState(checkNode(id));
    const [isCurrent, setCurrent] = React.useState(false);
    const [loadedData, setLoadedData] = React.useState(null);
    const [highlight, setHighlight] = React.useState(false);
    const [imagePreviewPos, setImagePreviewPos] = React.useState(null);
    const [menu, setMenu] = React.useState(false);
    const [error, setError] = React.useState(null);
    const treeNode = React.createRef();
    const _isMounted = React.useRef(true);

    // initialization
    const router = useRouter();
    const api = useData();
    const nav = useNav();
    const dialog = useDialog();

    // get user role
    const user = useUser();
    const {role = ['']} = user || {};
    const isAdmin = role[0] === 'administrator' || role[0] === 'super_administrator';

    // get full model label
    const modelLabel = getModelLabel(type);

    // handle toggle events
    const _handleToggle = () => {
        // toggle node to selected session nodes
        checkNode(id) ? removeNode(id) : addNode(id);
        // open collapsible
        setToggle(!toggle);
    }

    // handle view events
    const _handleView = () => {
        // add node to session path
        addNode(id);
        // reroute to requested data view
        router.update(createNodeRoute(type, 'show', id));
    }

    // handle dialog view
    // - sets node data in provider to load in dialog view
    const _handleDialog = (dialogID) => {
        dialog.setCurrent({
            dialogID: dialogID,
            id: id,
            model: type,
            label: label,
            metadata: metadata,
            attached: attached,
            owner: owner,
        });
    };

    /**
     * Mouseover image preview handler
     *
     * @public
     */

    const _handleMouseover = (e) => {
        setImagePreviewPos({
            position: 'absolute',
            left: e.pageX + 'px',
            top: e.pageY + 'px'
        });
    };

    const _handleMouseout = () => {
        setImagePreviewPos(null);
    };

    /**
     * Drag-and-drop handlers for node moves.
     *
     * @public
     * @param {Object} e
     */

    const _handleDragStart = (e) => {
        // attach node metadata to data transfer object
        e.dataTransfer.setData(
            'application/json',
            JSON.stringify({
                id: id, model: type, label: label, metadata: metadata, owner: owner
            })
        );
    };
    const _handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setHighlight(true);
    };
    const _handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setHighlight(false);
    };
    const _handleDrop = (e) => {
        e.preventDefault();
        // handle files to update form data state
        const nodeData = e.dataTransfer.getData('application/json') || null;
        setHighlight(false);

        // open dialog to process node move
        // - dialog is defined in navigator.menu.js
        if (nodeData) {
            const source = JSON.parse(nodeData)
            nav.setSelected({
                source: {
                    id: source.id || '',
                    model: source.model || '',
                    label: source.label || '',
                    metadata: source.metadata || {},
                    owner: source.owner || {}
                },
                destination: {
                    id: id,
                    model: type,
                    label: label,
                }
            });
            _handleDialog('move');
        }
    };

    // toggle button classnames
    const classnames = [
        'tree-node',
        hasDependents ? 'toggle' : 'leaf',
        toggle || checkNode(id) ? 'active' : '',
        isCurrent ? 'current' : ''
    ];

    // scroll to current top node
    React.useEffect(() => {
        _isMounted.current = true;
        if ( _isMounted.current && nav.scrollToView && (api.nodes.includes(id) && (type === 'surveyors' || type === 'projects') )) {
            treeNode.current.scrollIntoView();
            nav.scroll(false);
        }
        return () => {
            _isMounted.current = false;
        };
    }, [api, id, type, treeNode, nav]);

    // highlight tree node if in the current path
    React.useEffect(() => {
        setCurrent(api.nodes.includes(id));
    }, [api, id]);

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
        <div
            id={`treenode_${id}`}
            ref={treeNode}
            className={'tree-node'}
        >
            {
                isCaptureType(type) && imagePreviewPos &&
                <div style={imagePreviewPos || {}}>
                    <Image scale={'thumb'} url={url} />
                </div>
            }
            <div
                className={'h-menu'}
                onDrop={_handleDrop}
                onDragOver={_handleDragOver}
                onDragLeave={_handleDragLeave}
            >
                <ul className={highlight ? 'capture-draggable-highlight' : ''}>
                    {
                        isAdmin && ( type === 'historic_captures' || type === 'modern_captures' ) ?
                            <li
                                className={'move'}
                                draggable={true}
                                onDragStart={_handleDragStart}
                            >
                                <Button className={'capture-draggable'} icon={'move'} title={`Move ${label} to a new owner.`}/>
                            </li>
                            : <li>
                                <Button
                                    icon={hasDependents ? (toggle ? 'collapse' : 'expand') : 'empty'}
                                    className={classnames.join(' ')}
                                    title={`Expand ${label}.`}
                                    onClick={hasDependents ? _handleToggle : () => {}}
                                />
                            </li>
                    }
                    <li
                        onMouseOver={_handleMouseover}
                        onMouseLeave={_handleMouseout}
                    >
                        <Button
                            icon={type}
                            size={'lg'}
                            className={`tree-node-icon ${isCurrent ? ' current' : ''} ${status}`}
                            title={
                                `View ${modelLabel}: ${label} ${status ? ' \nSTATUS: ' + capitalize(status) : ''}`
                            }
                            onClick={_handleView}
                        />
                    </li>
                    <li>
                        <Button
                            label={label}
                            size={'sm'}
                            className={`tree-node-label`}
                            title={`View ${modelLabel}: ${label}`}
                            onClick={_handleView}
                        />
                    </li>
                    <li className={'push'}>
                        {
                            user
                                ? <Button className={'right-aligned'} icon={menu ? 'close' : 'options'} size={'sm'} onClick={() => {
                                    setMenu(!menu)
                                }}/>
                                : <EditorMenu
                                    size={'sm'}
                                    id={id}
                                    node={node}
                                    model={type}
                                    label={label}
                                    metadata={metadata}
                                    owner={owner}
                                    visible={['show', 'edit', 'new']}
                                />}
                    </li>
                </ul>
                {
                    menu && <EditorMenu
                        size={'lg'}
                        className={'right-aligned node-menu'}
                        id={id}
                        node={node}
                        model={type}
                        label={label}
                        metadata={metadata}
                        owner={owner}
                        visible={['show', 'edit', 'new']}
                    />
                }
            </div>
            {
                // toggle dependent nodes list
                toggle && hasDependents
                    ? error
                        ? <Button className={'msg error'} label={'An error occurred'} icon={'error'}/>
                        : loadedData
                            ?   <>
                                <TreeNodeList items={loadedData.sorted} />
                                {
                                    loadedData.unsorted.length > 0 &&
                                    <ul>
                                        <li>
                                            <Accordion
                                                className={'tree-node-unsorted unsorted'}
                                                type={'historic_captures'}
                                                label={'Unsorted Captures'}
                                            >
                                                <TreeNodeList items={loadedData.unsorted} />
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

const TreeNodeList = ({items}) => {
    return (
        <ul>
            {
                // return sorted nodes
                items
                    .map(item => {
                        const {
                            node = {},
                            file={},
                            hasDependents = false,
                            status = '',
                            label = '',
                            metadata={},
                            refImage={},
                            attached={}
                        } = item || {};
                        const { id = '', type = '', owner_id='', owner_type=''} = node || {};
                        const { file_size=0, mimetype='', filename='' } = file || {};
                        const { url='' } = refImage || {};
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
                                <TreeNode data={item} />
                            </li>
                        )
                    })
            }
        </ul>
    );
}

/**
 * [Node] Tree navigator component.
 *
 * @public
 *
 * @return
 */

const TreeNavigator = ({ hidden=true }) => {

    const nav = useNav();
    const treeRef = React.useRef();

    // window dimensions
    const [, winHeight] = useWindowSize();

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
                        <Accordion
                            key={`summary_stats`}
                            type={'chart'}
                            label={"Collection Summary"}
                            open={true}
                        >
                            <table className={'stats'}>
                                <tbody>
                                {
                                    (nav.stats.summary || []).map((stat, index) => {
                                        const {type='', count=''} = stat || {};
                                        return <tr key={`summary_stats_${index}`}>
                                            <th>{getModelLabel(type, 'label')}</th>
                                            <td>{count}</td>
                                        </tr>
                                    })
                                }
                                </tbody>
                            </table>
                        </Accordion>
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
                                                items={nav.tree[key]}
                                                filter={nav.filter}
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

export default React.memo(TreeNavigator)