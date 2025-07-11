/*!
 * MLE.Client.Components.Menus.Navigator
 * File: navigator.menu.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * Description
 *
 * The Navigator Menu is used to manage navigation and dialog-related functionality of the Navigator component.
 * - The setMode function is defined within the component. This function takes a navView parameter, which
 *   represents the desired navigation mode (e.g., 'tree', 'map', 'search'). When this function is called,
 *   it performs the following actions:
 *      - It toggles the visibility of the navigator (presumably a navigation panel or sidebar).
 *      - It sets the navigation mode (e.g., 'tree', 'map') using the nav.setMode function.
 *      - It sets a resize flag to indicate a change in the navigator's size.
 *      - It appears to update some internal state with setNavView.
 *
 * Inside the component's return statement:
 * - A div element with the class name viewer-menu is rendered.
 * - Within this div, there is another div element with the class name h-menu.
 * - Inside the inner div, there is an unordered list (ul) containing a list of navigation-related items.
 * - Each list item (li) contains a Button component that represents a navigation option. These buttons
 *   have various icons, labels, and tooltips. Each button has an onClick handler that calls specific
 *   functions when clicked. These functions include:
 * - Toggling the visibility of the navigator (icon: 'hopenleft' or 'hcloseleft').
 * - Changing the navigation mode to 'tree', 'map', 'search', etc.
 * - Opening a dialog box related to filtering or searching.
 *
 */


/**
 * Navigator menu component.
 *
 * View options for the navigator component.
 *
 * @public
 * @return {JSX.Element}
 */
import {useNav} from "../../providers/nav.provider.client";
import {useDialog} from "../../providers/dialog.provider.client";
import {setNavView, setPref} from "../../services/session.services.client";
import Button from "../common/button";
import React from "react";

export const NavigatorMenu = () => {

    const nav = useNav();
    const dialog = useDialog();

    // Sets the current navigation mode (tree/map/search/etc.)
    // - set in state and user session storage
    const setMode = (navView) => {
        // toggle navigator visibility
        nav.setToggle(true);
        // set navigator view
        nav.setMode(navView);
        nav.setResize(true);
        setNavView(navView);
    }

    return (
        <>
            <div className={'viewer-menu'}>
                <div className={'h-menu'}>
                    <ul>
                        <li>
                            <Button
                                className={'nav-toggle'}
                                disabled={nav.mode === 'iat'}
                                icon={nav.toggle ? 'hopenleft' : 'hcloseleft'}
                                title={nav.toggle ? 'Minimize navigator.' : 'Maximize navigator'}
                                onClick={() => {
                                    setPref('navToggle', !nav.toggle);
                                    nav.setToggle(!nav.toggle);
                                    nav.setResize(true);
                                }}
                            />
                        </li>
                        <li>
                            <Button
                                icon={'tree'}
                                label={!nav.compact && 'List'}
                                title={`View navigation tree.`}
                                onClick={() => {
                                    setMode('tree')
                                    nav.scroll(true);
                                }}
                            />
                        </li>
                        <li>
                            <Button
                                icon={'map'}
                                label={!nav.compact && 'Map'}
                                title={`View navigation map.`}
                                onClick={() => setMode('map')}
                            />
                        </li>
                        <li>
                            <Button
                                icon={'filter'}
                                label={!nav.compact && 'Filter'}
                                title={`Filter map stations.`}
                                className={nav.hasFilter ? 'active' : ''}
                                onClick={() => dialog.setCurrent({dialogID: 'filter'})}
                            />
                        </li>
                        <li>
                            <Button
                                icon={'search'}
                                label={!nav.compact && 'Search'}
                                title={`Full-text search of metadata.`}
                                onClick={() => setMode('search')}
                            />
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}