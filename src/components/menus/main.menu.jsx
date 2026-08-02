/*!
 * MLE.Client.Components.Menus.Main
 * File: main.menu.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

import React from 'react';
import { getRoot } from '../../utils/paths.utils.client';
import {getInfo} from "../../services/schema.services.client";
import {useNav} from "../../providers/nav.provider.client";
import Dialog from "../common/dialog";
import Button from "../common/button";

const MenuItems = ({onNavigate = () => {}}) => {
    const rootURL = getRoot();
    return <ul>
        <li><a href={rootURL} onClick={onNavigate}>Dashboard</a></li>
        <li><a rel={"noreferrer"} target={'_blank'} href={getInfo().mlp_url} title={'Navigate to main MLP website'} onClick={onNavigate}>MLP Website</a></li>
        <li><a href={'/toolkit'} title={'Open Alignment Tool'} onClick={onNavigate}>Alignment Tool</a></li>
        <li><a href={"mailto:mntnlgcy@uvic.ca"} title={'Open email client'} onClick={onNavigate}>Contact</a></li>
    </ul>
}

/**
 * Component for main navigation menu.
 *
 * @public
 */

const MainMenu = () => {
    const nav = useNav();

    const [showMenuDialog, setShowMenuDialog] = React.useState(false);

    if (nav.compact) {
        return <nav className={'main'}>
            <Button
                icon={'menu'}
                label={'Menu'}
                onClick={() => setShowMenuDialog(true)}
            />
            {
                showMenuDialog &&
                <Dialog
                    className={'top-layer'}
                    title={'Main Menu'}
                    callback={() => setShowMenuDialog(false)}
                >
                    <div style={{padding: '5px'}} className={'v-menu'}>
                        <MenuItems onNavigate={() => setShowMenuDialog(false)} />
                    </div>
                </Dialog>
            }
        </nav>;
    }

    return <nav className={'main'}><MenuItems /></nav>;
}
export default MainMenu;
