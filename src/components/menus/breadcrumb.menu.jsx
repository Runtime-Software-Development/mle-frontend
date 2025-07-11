/*!
 * MLE.Client.Components.Navigation.Breadcrumb
 * File: breadcrumb.menu.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Icon from '../common/icon';
import { createNodeRoute, filterPath, getRoot } from '../../utils/paths.utils.client';
import { useData } from '../../providers/data.provider.client';
import { getStaticLabel } from '../../services/schema.services.client';

/**
 * Breadcrumb navigation menu component.
 *
 * @public
 */

const BreadcrumbMenu = () => {

    const api = useData();
    const { path=[] } = api || {};

    /**
     * Build 'breadcrumb' navigation menu from current
     * route URI path.
     *
     * @api private
     */

    const _parseRoute = function() {
        const path = filterPath()
            .split("/")
            .filter(item => item !== '');

        // hide breadcrumb menu on front page
        if (path.length === 0) return [];
        return [<span>{getStaticLabel(`/${path[0]}`) || ''}</span>]
    };

    /**
     * Build 'breadcrumb' navigation menu from Node path.
     *
     * @api private
     */

    const _parseNodes = function(nodes) {
        // iterate over sorted path keys
        // sort node index descending and map to components
        return Object.keys(nodes)
            .sort(function(a, b){return b-a})
            .map(key => {
                // use node or file metadata
                const {node={}, file={}, label=''} = nodes[key] || {};
                const href = createNodeRoute(
                    node.type || file.file_type,
                    'show',
                    node.id || file.id);
                return <>
                        <Icon type={node.type || file.file_type} size={'sm'} />&#160;&#160;<a href={href}>{label}</a>
                        </>
            });

    };

    // select method of extracting path elements: node path or route path
    const isNode = typeof path === 'object' && Object.keys((path || {})).length > 0;
    const breadcrumbs = isNode ? _parseNodes(path) : _parseRoute();

    return (
        breadcrumbs &&
        <nav className={'breadcrumb'}>
            <div className={`breadcrumb-container`}>
                <ul>
                    <li>
                        <a href={getRoot()}><Icon type={'logo'} size={'sm'} /></a>
                    </li>
                    {
                        // node breadcrumb menu
                        breadcrumbs.map((item, index) => {
                                return (
                                    <li key={`item_${index}`}>{ item }</li>
                                )
                            })
                    }
                    {
                        // include menu text for new item
                        filterPath() === '/' ? <li><span>{'Home'}</span></li> : ''
                    }
                </ul>
            </div>
        </nav>
    )
}

export default BreadcrumbMenu;
