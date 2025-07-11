/*!
 * MLE.Client.Components.Menus.Banner
 * File: banner.menu.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import MainMenu from './main.menu';
import Logo from '../common/logo';
import LogoutMenu from "./logout.menu";
import LoginMenu from "./login.menu";
import {useUser} from "../../providers/user.provider.client";

/**
 * Main navigation bar.
 *
 * @public
 */

const BannerMenu = () => {
    const user = useUser();
    return (
        <header>
            <div className={'banner'}>
                <div className={'navbar h-menu'}>
                    <ul>
                        <li><Logo /></li>
                        <li className={'push'}><MainMenu /></li>
                        <li>
                            { user ? <LogoutMenu /> : <LoginMenu /> }
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default React.memo(BannerMenu);
