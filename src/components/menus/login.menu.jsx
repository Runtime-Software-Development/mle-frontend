/*!
 * MLE.Client.Components.Menus.Login
 * File: login.menu.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

import React from "react";
import Form from '../common/form';
import { useUser } from '../../providers/user.provider.client';
import { useAuth } from '../../providers/auth.provider.client';
import { genSchema } from '../../services/schema.services.client';
import { UserMessage } from '../common/message';
import {useRouter} from "../../providers/router.provider.client";
import {redirect} from "../../utils/paths.utils.client";
import Accordion from "../common/accordion";
import {useNav} from "../../providers/nav.provider.client";
import Button from "../common/button";
import Dialog from "../common/dialog";

/**
 * User sign-in form component.
 *
 * @public
 */

const LoginMenu = () => {

    const user = useUser();
    const auth = useAuth();
    const nav = useNav();
    const router = useRouter();

    const schema = genSchema({ view:'login', model:'users'});
    const [message, setMessage] = React.useState(null);
    const [showDialog, setShowDialog] = React.useState(false);

    // login callback
    const _callback = async (credentials) => {
        auth.login(credentials).then(msg => {
            if (msg) setMessage(msg);
            else redirect(router.route);
        });
    }

    // cancel login
    const _onCancel = () => {
        document.body.click();
    }

    const loginContent = <div className={'user-menu'}>
        <UserMessage
            message={message}
            closeable={false}
        />
        <Form
            model={'users'}
            schema={schema}
            callback={_callback}
            onCancel={_onCancel}
        />
    </div>;

    return <>
        { user
            ? <div>User {user.email} is signed in.</div>
            :
            <nav className={'main'}>
                {
                    nav.compact
                        ? <>
                            <Button
                                icon={'login'}
                                label={'Login'}
                                onClick={() => setShowDialog(true)}
                            />
                            {
                                showDialog &&
                                <Dialog
                                    className={'top-layer'}
                                    title={'User Login'}
                                    callback={() => setShowDialog(false)}
                                >
                                    {loginContent}
                                </Dialog>
                            }
                        </>
                        : <Accordion type={'user'} hideOnClick={true}>
                            {loginContent}
                        </Accordion>
                }
            </nav>
            }
        </>
}

export default React.memo(LoginMenu);
