/*!
 * MLE.Client.Components.Toolkit.LoadButton
 * File: load_button.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import {memo} from 'react';
import {useIat} from "../../../providers/alignment.provider.client";
import Button from "../../common/button";

/**
 * Panel file load button.
 *
 * @public
 */

const LoadButton = ({id, loader }) => {

    const iat = useIat();
    const panel = iat ? iat[id] : {};
    const workingStates = ['loading', 'downloading'];
    const buttonStyles = {
        width: panel.properties.base_dims.w,
        height: panel.properties.base_dims.h,
        paddingTop: panel.properties.base_dims.h / 2 - 15,
        zIndex: 88890
    }

    return <>
        {
            panel.status === 'error' &&
            <div className={'layer canvas-placeholder'} style={buttonStyles}>
                <Button className={'error'} icon={'error'} label={'Error: Click panel reset.'} />
            </div>
        }
        {
            workingStates.includes(panel.status) &&
            <div className={'layer canvas-placeholder'} style={buttonStyles}>
                <Button className={'canvas-status'} icon={'spinner'} label={`Working (${panel.status})`} spin={true}/>
            </div>
        }
        { !panel.image && panel.status !== 'loading' &&
        <div
            className={'layer canvas-placeholder'}
            style={buttonStyles}
        ><Button
            icon={'image'}
            label={'Click to load image'}
            onClick={() => {
                iat.setDialog({
                    type: 'loadImage',
                    id: panel.properties.id,
                    label: panel.properties.label,
                    callback: loader
                });
            }}
        /></div>
        }
    </>;
};

export default memo(LoadButton);