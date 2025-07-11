/*!
 * MLE.Client.App
 * File: App.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Core app component. Includes interactive grid for adjusting navigator
 * and viewer panel resizing.
 *
 * ---------
 * Revisions
 * - 06-08-2023   Major upgrade to convert layout to interactive grid.
 */

import React from 'react';
import { useUser } from './providers/user.provider.client';
import { useRouter } from './providers/router.provider.client';
import UnavailableError from './components/error/unavailable.error';
import BannerMenu from "./components/menus/banner.menu";
import BoundaryError from "./components/error/boundary.error";
import Navigator from "./components/navigator/navigator";
import VisitorView from "./components/views/visitor.view";
import EditorView from "./components/views/editor.view";
import ViewerMenu from "./components/menus/viewer.menu";
import BreadcrumbMenu from "./components/menus/breadcrumb.menu";
import {useNav} from "./providers/nav.provider.client";
import {useWindowSize} from "./utils/events.utils.client";
import DialogSelector from "./components/selectors/dialog.selector";
import Loading from "./components/common/loading";
import {useAuth} from "./providers/auth.provider.client";
import Tooltip from "./components/common/tooltip";
import styles from '../src/components/styles/layout.module.css';


/**
 * Core client application component.
 *
 * @public
 */

export default function App() {

    const router = useRouter();
    const user = useUser();
    const nav = useNav();
    const auth = useAuth();

    // create reference to navigator panels and resize slider
    const mainRef = React.useRef();
    const viewPanelRef = React.useRef();
    const navPanelRef = React.useRef();
    const sliderRef = React.useRef();

    // create reference to panel resizer
    let sliding = false;
    const minNavPanelWidth = 400;
    const maxNavPanelWidth = 1200;
    let slideInit = 0;
    const rightOffest = 20;
    const winWidthThreshold = 800;

    // Addresses: Can't perform a React state update on unmounted component.
    const _isMounted = React.useRef(false);

    // window dimensions
    const [winWidth, winHeight] = useWindowSize();

    // initialize/reset panel widths
    React.useEffect(() => {
        _isMounted.current = true;

        if (
            _isMounted.current
            && sliderRef.current
            && navPanelRef.current
            && viewPanelRef.current
        ) {
            /* Compute navigator panel resize */
            const navPanelWidth = nav.toggle ? Math.max(
                Math.min( navPanelRef.current.clientWidth, maxNavPanelWidth), minNavPanelWidth
            ) : 0;

            /* Resize panel grid */
            const cols = [
                navPanelWidth,
                sliderRef.current.offsetWidth,
                mainRef.current.clientWidth - navPanelWidth - rightOffest
            ];

            // check if at compact (responsive) breakpoint
            nav.setCompact(winWidth < winWidthThreshold);

            // set new column widths
            mainRef.current.style.gridTemplateColumns = cols.map(c => c.toString() + "px").join(" ");
        }
        return () => {_isMounted.current = false;}
    }, [nav.toggle, winWidth, winHeight]);

    /* Initialize panel resize */
    function _resizeStart(e) {
        /* if slider is no longer engaged, exit this function: */
        if (sliding) return false;
        sliding = true;
        slideInit = e.pageX;
        nav.setToggle(true);
    }

    /* Position the slider and resize panel */
    function _resizeEnd() {
        /* if slider is no longer engaged, exit this function: */
        if (!sliding) return false;
        sliding = false;
        nav.setResize(true);
    }

    /* Position the slider and resize panel */
    function _resize(e) {
        /* if slider is no longer engaged, exit this function: */
        if (!sliding) return false;

        /* Compute navigator panel resize */
        const navPanelWidth = Math.max(Math.min( e.clientX, maxNavPanelWidth), minNavPanelWidth);

        /* Resize panel grid */
        const cols = [
            navPanelWidth,
            sliderRef.current.offsetWidth,
            mainRef.current.clientWidth - navPanelWidth - rightOffest
        ];

        // set new column widths
        mainRef.current.style.gridTemplateColumns = cols.map(c => c.toString() + "px").join(" ");

        // e.preventDefault();

    }

    return router.online
        ? <div className={"page"}>
            { auth.processing && <Loading overlay={true} /> }
            <DialogSelector/>
            <Tooltip />
            <BannerMenu/>
            <ViewerMenu/>
            <BreadcrumbMenu/>
            <main>
                <div
                    className={styles.main}
                    ref={mainRef}
                    onMouseUp={_resizeEnd}
                    onMouseMove={_resize}
                    onTouchEnd={_resizeEnd}
                    onTouchMove={_resize}
                >
                    <BoundaryError>
                        <div ref={navPanelRef} className={styles.navigator}>
                            <Navigator />
                        </div>
                    </BoundaryError>
                    <div
                        className={styles.dragbar}
                        ref={sliderRef}
                        onMouseDown={_resizeStart}
                        onTouchStart={_resizeStart}
                    >
                    </div>
                    <BoundaryError>
                        <div ref={viewPanelRef} className={styles.viewer}>
                            {
                                user ? <EditorView/> : <VisitorView/>
                            }
                        </div>
                    </BoundaryError>
                </div>
            </main>
        </div>
        : <UnavailableError/>
}