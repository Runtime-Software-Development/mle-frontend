/*!
 * MLE.Client.Components.Menus.Logout
 * File: login.menu.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from "react";
import { useUser } from '../../providers/user.provider.client';
import { useAuth } from '../../providers/auth.provider.client';
import {redirect} from "../../utils/paths.utils.client";
import Accordion from "../common/accordion";
import Button from "../common/button";
import {useNav} from "../../providers/nav.provider.client";

/**
 * User navigation menu (authenticated).
 *
 * @public
 */

const LogoutMenu = () => {

    const user = useUser();
    const auth = useAuth();
    const nav = useNav();

    return (
        <nav className={'main'}>
            <Accordion type={'user'} label={ !nav.compact ? user.email : ''} hideOnClick={true}>
                <ul className={'user-menu'}>
                        <li><b>{user.email} ({user.label})</b></li>
                        <li><Button
                            className={'submit'}
                            icon={'logout'}
                            label={'Sign Out'}
                            onClick={() => {
                                auth.logout().then(() => {redirect('/')})
                            }}
                        /></li>
                </ul>
            </Accordion>
        </nav>
    );
};

export default React.memo(LogoutMenu);
