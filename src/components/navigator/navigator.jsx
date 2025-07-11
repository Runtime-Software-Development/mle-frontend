/*!
 * MLE.Client.Components.Navigator
 * File: navigator.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react'
import TreeNavigator from './tree.navigator';
import MapNavigator from './map.navigator';
import ServerError from '../error/server.error';
import SearchNavigator from './search.navigator';
import { useNav } from "../../providers/nav.provider.client";

/**
 * Main navigator component.
 *
 * @public
 * @return {JSX.Element}
 */

const Navigator = () => {
    const nav = useNav();
    return  (
        !nav.error
            ?   <div className={`navigator`}>
                    <TreeNavigator hidden={nav.mode !== 'tree'}/>
                    <MapNavigator hidden={nav.mode !== 'map'} />
                    <SearchNavigator hidden={nav.mode !== 'search'}/>
                </div>
            : <ServerError/>
        )
}

export default React.memo(Navigator);