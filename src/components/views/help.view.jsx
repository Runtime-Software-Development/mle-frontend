/*!
 * MLE.Client.Components.Views.Help
 * File: help.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import explorerHelpContent from '../content/explorer.help';
import iatHelpContent from '../content/alignment.help';
import editorHelpContent from '../content/editor.help';
import mapHelpContent from '../content/map.help';
import Button from '../common/button';
import mapHelp from "../content/map.help";

/**
 * Tab layout for help pages.
 * - Creates tab to toggle data panels (<Tab>).
 * - Input Data Format:
 *   {[ID]: { label: <LABEL>, data: <CONTENT>}, ... }
 *
 * @public
 * @return {JSX.Element}
 */

const HelpTabs = ({
                      items = [],
                      selectedTab = 0,
                      setSelectedTab = ()=>{},
                      className = '',
                      orientation = 'vertical',
                  }) => {

    // highlight selected tab (via classname)
    const onToggle = (id) => {
        return orientation === 'vertical'
            ? id === selectedTab ? 'hclose' : 'hopen'
            : id === selectedTab ? 'hopen' : 'hclose';
    };

    // select view orientation
    const tabOrientation = orientation === 'vertical' ? 'h-menu' : 'v-menu';
    const menuOrientation = orientation === 'vertical' ? 'v-menu' : 'h-menu';

    return (
        <div className={`tab ${tabOrientation} ${className}`}>
            <ul>
                <li className={`tab-menu ${menuOrientation}`}>
                    <div>
                    <ul>
                        {
                            items.map((item, id) => {
                                const { label = '' } = item || {};
                                return <li key={`tab_${id}`}>
                                    <Button
                                        disabled={!item.data}
                                        className={selectedTab === id ? 'active' : ''}
                                        icon={onToggle(id)}
                                        title={`View ${label}.`}
                                        label={label}
                                        onClick={() => {
                                            setSelectedTab(id);
                                        }}
                                    />
                                </li>;
                            })
                        }
                    </ul>
                    </div>
                </li>
                <li className={`tab-data ${orientation}`}>
                    {
                        items.hasOwnProperty(selectedTab) ? items[selectedTab].data || '' : ''
                    }
                </li>
            </ul>
        </div>
    );
};

/**
 * Help info dialog component.
 *
 * @public
 */

const HelpView = ({ section = 0, page = 0 }) => {

    const [sectionSelected, setSectionSelected] = React.useState(section);
    const [explorerPageSelected, setExplorerPageSelected] = React.useState(page);
    const [mapPageSelected, setMapPageSelected] = React.useState(page);
    const [editorPageSelected, setEditorPageSelected] = React.useState(page);
    const [iatPageSelected, setIATPageSelected] = React.useState(page);

    /**
     * Navigate to help section.
     */

    const gotoPage = (section, page) => {
        setSectionSelected(section);

        const pageSelector = [
            setExplorerPageSelected,
            setMapPageSelected,
            setIATPageSelected,
            setEditorPageSelected,
        ]

        // set selected page
        if (section < pageSelector.length) {
            pageSelector[section](page);
        }
    };

    const exploreHelp = explorerHelpContent(gotoPage);
    const editorHelp = editorHelpContent(gotoPage);
    const iatHelp = iatHelpContent(gotoPage);
    const mapHelp = mapHelpContent(gotoPage)

    // index of help sections
    const _sections = [
        {
            label: 'Explorer Guide',
            data: <HelpTabs
                orientation={'vertical'}
                items={exploreHelp}
                selectedTab={explorerPageSelected}
                setSelectedTab={setExplorerPageSelected}
                className={'help'}
            />,
        },
        {
            label: 'Map Tool Guide',
            data: <HelpTabs
                orientation={'vertical'}
                items={mapHelp}
                selectedTab={mapPageSelected}
                setSelectedTab={setMapPageSelected}
                className={'help'}
            />,
        },
        {
            label: 'Alignment Tool Guide',
            data: <HelpTabs
                orientation={'vertical'}
                items={iatHelp}
                selectedTab={iatPageSelected}
                setSelectedTab={setIATPageSelected}
                className={'help'}
            />,
        },
        {
            label: 'Editor Guide',
            data: <HelpTabs
                orientation={'vertical'}
                items={editorHelp}
                selectedTab={editorPageSelected}
                setSelectedTab={setEditorPageSelected}
                className={'help'}
            />,
        },
    ];

    return <HelpTabs
        orientation={'horizontal'}
        items={_sections}
        selectedTab={sectionSelected}
        setSelectedTab={setSectionSelected}
        className={'help'}
    />;
};

export default HelpView;
