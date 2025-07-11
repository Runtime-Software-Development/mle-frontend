/*!
 * MLE.Client.Components.Toolkit.Panel.Menu
 * File: menu.panel.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React, {memo} from 'react';
import Button from '../../common/button';
import {useIat} from "../../../providers/alignment.provider.client";
import {useUser} from "../../../providers/user.provider.client";
import {useNav} from "../../../providers/nav.provider.client";
import {useDialog} from "../../../providers/dialog.provider.client";
import {getTooltip} from "../../content/alignment.help";

/**
 * Control menu for IAT panel.
 *
 * @public
 * @param {String} id
 * @param ref
 * @param {Object} methods
 * @return {JSX.Element}
 */


const PanelMenu = ({id = null, methods=null}) => {

    const iat = useIat();
    const user = useUser();
    const nav = useNav();
    const dialog = useDialog();

    // select panel
    const panel = iat && id ? iat[id] : {};

    // menu is disabled if no image is loaded
    const disabled = panel.status !== 'loaded' || !panel.image;

    return <>
        {
            panel &&
            <div className={'canvas-view-controls h-menu'}>
                <ul>
                    <li><Button
                        icon={'load'}
                        title={'Load image into canvas.'}
                        onClick={() => {
                            iat.setDialog({
                                type: 'loadImage',
                                id: panel.properties.id,
                                label: panel.properties.label,
                                callback: methods.load
                            });
                        }}
                    /></li>
                    <li><Button
                        icon={'download'}
                        disabled={disabled}
                        title={'Download image file.'}
                        onClick={() => {
                            iat.setDialog({
                                type: 'saveImage',
                                id: panel.properties.id,
                                label: panel.properties.label,
                                callback: methods.saveAs,
                            });
                        }}
                    /></li>
                    <li><Button
                        icon={'upload'}
                        disabled={disabled || !user || !user.isAdmin}
                        title={'Upload image to library.'}
                        onClick={() => {
                            nav.setToggle(true);
                            nav.setMode('tree');
                            dialog.setTooltip({
                                message: getTooltip('uploadMLPImage'),
                                position: {x: 300, y: 300},
                                direction: 'left'
                            });
                        }}
                    /></li>
                    <li><Button
                        icon={'sync'}
                        disabled={disabled}
                        title={'Sync current image state.'}
                        onClick={methods.saveState}
                    /></li>
                    <li><Button
                        disabled={!panel.image}
                        icon={'undo'}
                        title={'Reset to original source image.'}
                        onClick={methods.reset}
                    /></li>
                    <li><Button
                        disabled={disabled}
                        icon={'resize'}
                        title={'Resize image and/or canvas.'}
                        onClick={() => {
                            iat.setDialog({
                                type: 'resize',
                                id: id,
                                label: panel.properties.label,
                                callback: methods.resize,
                            });
                        }}
                    /></li>
                    <li><Button
                        disabled={disabled}
                        icon={'compress'}
                        title={'Scale image to fit canvas.'}
                        onClick={methods.fit}
                    /></li>
                    <li><Button
                        disabled={disabled}
                        icon={'enlarge'}
                        title={'Show full-sized image in canvas.'}
                        onClick={methods.expand}
                    /></li>
                    <li><Button
                        disabled={disabled}
                        icon={'zoomIn'}
                        title={'Zoom in.'}
                        onClick={methods.zoomIn}
                    /></li>
                    <li><Button
                        disabled={disabled}
                        icon={'zoomOut'}
                        title={'Zoom out.'}
                        onClick={methods.zoomOut}
                    /></li>
                    <li><Button
                        disabled={disabled}
                        icon={'erase'}
                        title={'Erase Mask Overlay.'}
                        onClick={methods.clear}
                    /></li>
                    <li><Button
                        icon={'delete'}
                        disabled={disabled}
                        title={'Delete image data.'}
                        onClick={() => {
                            iat.setDialog({
                            type: 'remove',
                            id: panel.properties.id,
                            label: panel.properties.label,
                            callback: methods.remove,
                        });
                        }}
                    /></li>

                </ul>
            </div>
        }
    </>;
};
export default memo(PanelMenu);

