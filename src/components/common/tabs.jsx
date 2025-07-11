/*!
 * MLE.Client.Components.Common.Tabs
 * File: tabs.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import {genID} from "../../utils/data.utils.client";
import {getPref, setPref} from "../../services/session.services.client";

// generate unique ID value for tabs
const tabID = genID();

/**
 * Tab layout.
 * - Creates tab to toggle data panels (<Tab>).
 * - Input Data Format:
 *   {[ID]: { label: <LABEL>, data: <CONTENT>}, ... }
 *   orientation: [vertical | horizontal]
 *
 * @public
 * @param items
 * @param defaultTab
 * @param className
 * @param orientation
 * @param menu
 * @return {JSX.Element}
 */

const Tabs = ({
                  prefKey=null,
                  items = [],
                  defaultTab = 0,
                  className = 'default',
                  orientation = 'vertical'
              }) => {

    // get preferential tab ID in local storage as initial open tab
    const initTab = prefKey && getPref(prefKey) ? getPref(prefKey) : defaultTab;

    // selected tab state (get any preference history for selected tabs component)
    // - ensure initial tab is in range of tabs
    const [selectedTabID, setSelectedTabID] = React.useState(items.length <= initTab ? 0 : initTab);

    // highlight selected tab (via classname)
    const onToggle = (id) => {
        return orientation === 'vertical'
            ? id === selectedTabID ? 'hclose' : 'hopen'
            : id === selectedTabID ? 'hopen' : 'hclose'
    };

    // check if single tab
    const isSingle = items.length === 1;
    // select view orientation
    const tabOrientation = orientation === 'vertical' ? 'h-menu' : 'v-menu';
    const menuOrientation = orientation === 'vertical' ? 'v-menu' : 'h-menu';

    return (
        isSingle
            ? (items[selectedTabID] && items[selectedTabID].data) || '' :
            <div className={`tab ${tabOrientation} ${className}`}>
            <ul>
                <li className={`tab-menu ${menuOrientation}`}>
                    <ul>
                        {
                            items.map((item, index) => {
                                const { label = '' } = item || {};
                                return <li key={`tab_${tabID}_${index}`}>
                                    <Button
                                        disabled={!item.data}
                                        className={selectedTabID === index ? 'active' : ''}
                                        icon={onToggle(index)}
                                        title={`Open ${label} tab.`}
                                        label={label}
                                        onClick={() => {
                                            setSelectedTabID(index);
                                            // set tab preference to index
                                            if (prefKey) setPref(prefKey, index);
                                        }}
                                    />
                                </li>;
                            })
                        }
                    </ul>
                </li>
                <li className={`tab-data ${orientation}`}>
                    {
                        items.hasOwnProperty(selectedTabID) ? items[selectedTabID].data || '' : ''
                    }
                </li>
            </ul>
        </div>
    );
};

export default Tabs;