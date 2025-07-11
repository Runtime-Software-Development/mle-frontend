/*!
 * MLE.Client.Components.Menus.Main
 * File: main.menu.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import { getRoot } from '../../utils/paths.utils.client';
import {getInfo} from "../../services/schema.services.client";
import Accordion from "../common/accordion";
import {useNav} from "../../providers/nav.provider.client";

const MenuItems = () => {
    const rootURL = getRoot();
    return <ul>
        <li><a href={rootURL}>Dashboard</a></li>
        <li><a rel={"noreferrer"} target={'_blank'} href={getInfo().mlp_url} title={'Navigate to main MLP website'}>MLP Website</a></li>
        <li><a href={'/toolkit'} title={'Open Alignment Tool'}>Alignment Tool</a></li>
        <li><a href={"mailto:mntnlgcy@uvic.ca"} title={'Open email client'}>Contact</a></li>
    </ul>
}

/**
 * Component for main navigation menu.
 *
 * @public
 */

const MainMenu = () => {
    const nav = useNav();
    return nav.compact
        ? <nav className={'main'}>
            <Accordion label={'Menu'}>
                <div style={{padding: '5px'}} className={'v-menu'}>
                    <MenuItems />
                </div>
            </Accordion>
        </nav>
        : <nav className={'main'}><MenuItems /></nav>;
}
export default MainMenu;
