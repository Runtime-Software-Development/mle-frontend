/*!
 * MLE.Client.Components.Menus.Logout
 * File: login.menu.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

import React from "react";
import { useUser } from '../../providers/user.provider.client';
import { useAuth } from '../../providers/auth.provider.client';
import {redirect} from "../../utils/paths.utils.client";
import Accordion from "../common/accordion";
import Button from "../common/button";
import {useNav} from "../../providers/nav.provider.client";
import Dialog from "../common/dialog";

/**
 * User navigation menu (authenticated).
 *
 * @public
 */

const LogoutMenu = () => {

    const user = useUser();
    const auth = useAuth();
    const nav = useNav();
    const [showDialog, setShowDialog] = React.useState(false);

    const menuContent = <ul className={'user-menu'}>
        <li><b>{user.email} ({user.label})</b></li>
        <li><Button
            className={'submit'}
            icon={'logout'}
            label={'Sign Out'}
            onClick={() => {
                auth.logout().then(() => {redirect('/')})
            }}
        /></li>
    </ul>;

    return (
        <nav className={'main'}>
            {
                nav.compact
                    ? <>
                        <Button
                            icon={'user'}
                            label={'User'}
                            onClick={() => setShowDialog(true)}
                        />
                        {
                            showDialog &&
                            <Dialog
                                className={'top-layer'}
                                title={'User Menu'}
                                callback={() => setShowDialog(false)}
                            >
                                {menuContent}
                            </Dialog>
                        }
                    </>
                    : <Accordion type={'user'} hideOnClick={true}>
                        {menuContent}
                    </Accordion>
            }
        </nav>
    );
};

export default React.memo(LogoutMenu);
