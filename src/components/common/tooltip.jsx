/*!
 * MLE.Client.Components.Common.Tooltip
 * File: tooltip.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Tooltips are positionable popup messages that overlay the content; only
 * shown if message context has been set.
 *
 * ------
 * Context
 * dialog       Uses dialog provider for tooltip content and screen position
 *
 * ---------
 * Revisions
 * - 09-07-2023   New tooltip component added to show popup messages
 */

import React from 'react';
import styles from '../styles/tooltip.module.css';
import {useDialog} from "../../providers/dialog.provider.client";
import Icon from "./icon";

/**
 * Tooltip component.
 *
 * @public
 */

const Tooltip = () => {
    const dialog = useDialog();
    const {message, position, direction='left'} = dialog.tooltip || {};

    // clear the tooltip from the screen when user clicks anywhere
    const _clear = () => {
        dialog.setTooltip(null);
    }

    return (
        dialog.tooltip &&
        <div className={styles.background} onClick={_clear}>
            <div style={{left: position.x || 0, top: position.y || 0}} className={styles.tooltip}>
                <span>{message}</span>
                <div className={styles[direction]}>
                    <Icon size={'3x'} type={direction}/>
                </div>
            </div>
        </div>
    )
}

export default Tooltip;
