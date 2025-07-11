/*!
 * MLE.Client.Components.Views.Editor
 * File: editor.view.js
 * Copyright(c) 2024 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import DataView from '../selectors/view.selector';
import Message from '../common/message';
import StaticView from '../selectors/static.selector';
import { useRouter } from '../../providers/router.provider.client';
import HeaderMenu from '../menus/header.menu';
import {useWindowSize} from "../../utils/events.utils.client";
import Footer from "../content/footer";

/**
 * EditorView component.
 *
 * This component is rendered when the user is authenticated.
 *
 * The component renders a dashboard view. If the staticView
 * property is set in the router, the StaticView component is
 * rendered. Otherwise the DataView component is rendered.
 *
 * @public
 * @return {JSX.Element} result
 */
const EditorView = () => {
    const router = useRouter();

    // window dimensions
    const [, winHeight] = useWindowSize();

    return (
        <>
            <div className={'editor'}>
                <div
                    className={`view dashboard`}
                    style={{height: (winHeight - 140) + 'px'}}
                >
                    <HeaderMenu/>
                    <Message/>
                    {/* render static or data view depending on the router props */}
                    {
                        router.staticView
                            ? <StaticView type={
                                router.staticView === 'dashboard' ? 'dashboardView' : router.staticView
                            }/>
                            : <DataView/>
                    }
                    <Footer/>
                </div>
            </div>
        </>
        )
};

export default React.memo(EditorView);