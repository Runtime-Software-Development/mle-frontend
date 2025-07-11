/*!
 * MLE.Client.Alignment
 * File: alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Main Alignment Tool component. The alignment makes extensive use of the Canvas API
 * for image rendering and markup. Image transformations use the OpenCV.js
 * JavaScript libraries.
 *
 * ---------
 * Revisions
 * - 09-14-2023   Automatically close navigator on page focus
 *
 */

import {memo} from 'react';
import PanelIat from './panel/panel.alignment';
import {MenuAlignment} from './menu.alignment';
import {DialogAlignment} from "./dialog.alignment";
import {useIat} from "../../providers/alignment.provider.client";
import {UserMessage} from "../common/message";
import {useNav} from "../../providers/nav.provider.client";


/**
 * Canvas API image editor component.
 *
 * @public
 */

const Alignment = () => {

    const iat = useIat();
    const nav = useNav();

    // close navigator if opened
    const _closeNav = () => {
        if (nav.toggle) nav.setToggle(false);
    }

    return <div onClick={_closeNav} >
            <DialogAlignment />
            <UserMessage className={'canvas-message'} message={iat.message} onClose={()=>{iat.setMessage(null)}} />
            <div className={'canvas-board'}>
                <PanelIat id={'panel1'} />
                <MenuAlignment />
                <PanelIat id={'panel2'} />
            </div>
        </div>;
};

export default memo(Alignment);


