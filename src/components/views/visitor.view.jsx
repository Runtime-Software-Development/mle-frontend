/*!
 * MLE.Client.Components.Views.Visitor
 * File: visitor.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Message from '../common/message';
import DataView from '../selectors/view.selector';
import StaticView from '../selectors/static.selector';
import { useRouter } from '../../providers/router.provider.client';
import HeaderMenu from '../menus/header.menu';
import Footer from "../content/footer";
import {useWindowSize} from "../../utils/events.utils.client";

/**
 * Render viewer panel component (unauthenticated users).
 *
 * @public
 */

const VisitorView = () => {
    const router = useRouter();

    // window dimensions
    const [, winHeight] = useWindowSize();

    return (
        <div className={'viewer'}>
            <div
                className={`view`}
                style={{height: (winHeight - 140) + 'px'}}
            >
                <HeaderMenu />
                <Message />
                {
                    router.staticView
                    ? <StaticView type={router.staticView === 'dashboard' ? 'dashboardView' : router.staticView} />
                    : <DataView />
                }
                <Footer/>
            </div>
        </div>
    )
};

export default React.memo(VisitorView);
