/*!
 * MLE.Client.Components.Toolkit.Panel.Info
 * File: panel.info.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Information display for the panel image dimensions, format and status.
 *
 * ---------
 * Revisions
 * - 09-07-2023   Updated instructions for upgraded Toolkit workflows and features.
 * - 25-08-2023   Include magnification scale
 */

import { getModelLabel } from '../../../services/schema.services.client';
import Button from '../../common/button';
import { sanitize } from '../../../utils/data.utils.client';
import {useEffect, useState} from 'react';
import { getScale, scalePoint } from '../tools/scaler.alignment';
import { createNodeRoute } from '../../../utils/paths.utils.client';
import {useIat} from "../../../providers/alignment.provider.client";
import Accordion from "../../common/accordion";
import Icon from "../../common/icon";

/**
 * Canvas info status.
 *
 * @param id
 * @public
 */

const PanelInfo = ({ panel }) => {

    const iat = useIat();
    const [scale, setScale] = useState(getScale(panel.properties.image_dims, panel.properties.render_dims));

    // update scale upon dimension change
    useEffect(() => {
        setScale(getScale(panel.properties.image_dims, panel.properties.render_dims))
    }, [panel.properties.image_dims, panel.properties.render_dims])

    // compute actual cursor position in image
    const actual = scalePoint(panel.pointer, panel.properties.image_dims, panel.properties.render_dims);
    // compute magnification of rendered image
    const magScale = getScale(panel.properties.magnified_dims, panel.properties.render_dims)

    return <div id={`canvas-view-${panel.properties.id}-info`} className={'canvas-view-info'}>
        <Accordion
            className={'overlay'}
            hideOnClick={true}
            label={'Panel Info'}
            menu={
                <table>
                    <tbody>
                    <tr>
                        <th style={{textAlign: 'right'}}>Canvas:</th>
                        <td style={{width:'100px', whiteSpace: 'nowrap'}}>
                            ({panel.pointer.x}, {panel.pointer.y})</td>
                        <th style={{textAlign: 'right'}}>Image:</th>
                        <td style={{width:'100px', whiteSpace: 'nowrap'}}>
                            ({actual.x}, {actual.y})</td>
                        <th style={{textAlign: 'right'}}>File:</th>
                        <td style={{width:'100px', whiteSpace: 'nowrap'}}>
                            { panel.properties.filename ? panel.properties.filename.substring(0, 10) : 'Not Loaded' }</td>
                        <th style={{textAlign: 'right'}}>Size:</th>
                        <td style={{width:'100px', whiteSpace: 'nowrap'}}>
                            {sanitize(panel.properties.file_size, 'filesize')}</td>
                    </tr>
                    </tbody>
                </table>
            }
        >
            <table>
                <tbody>
                <tr>
                    <th>File:</th>
                    <td style={{width: '75%'}} className={'h-menu'}>
                        <ul>
                            <li>
                                {
                                    panel.properties.filename ? panel.properties.filename : 'Not Loaded'
                                }
                            </li>
                            {
                                panel.properties.owner_id &&
                                <li className={'push'}><Button
                                    icon={'show'}
                                    title={'View image metadata.'}
                                    label={`${ getModelLabel(panel.properties.file_type)}`}
                                    onClick={() => {iat.setDialog({
                                        id: panel.properties.id,
                                        label: panel.properties.label,
                                        type: 'capture',
                                    })}}
                                /><a href={
                                    createNodeRoute(panel.properties.owner_type, 'show', panel.properties.owner_id)
                                } target={'_blank'}
                                    title={'Open capture information in new window.'}
                                     rel={"noreferrer"}
                                ><Icon type={'externalLink'} /></a></li>
                            }
                        </ul>
                    </td>
                </tr>
                </tbody>
            </table>
            <table>
                <tbody>
                <tr>
                    <th>Type:</th>
                    <td>{panel.properties.mime_type || '-'}</td>
                    <th>Size</th>
                    <td colSpan={3}>{sanitize(panel.properties.file_size, 'filesize')}</td>
                </tr>
                <tr>
                    <th>Canvas Cursor:</th>
                    <td>({panel.pointer.x}, {panel.pointer.y})</td>
                    <th>Image Cursor:</th>
                    <td>({actual.x}, {actual.y})</td>
                </tr>
                <tr>
                    <th>Scale:</th>
                    <td>1:{scale.x.toFixed(2)}</td>
                    <th>Magnification:</th>
                    <td>{magScale.x.toFixed(2)}</td>
                </tr>
                <tr>
                    <th>Canvas Offset:</th>
                    <td>({panel.properties.render_dims.x}, {panel.properties.render_dims.y})</td>
                    <th>Image Offset:</th>
                    <td>(
                        {Math.round(scale.x * panel.properties.render_dims.x)},
                        {Math.round(scale.y * panel.properties.render_dims.y)}
                        )</td>
                </tr>
                <tr>
                    <th>Rendered</th>
                    <td>[{panel.properties.render_dims.w}, {panel.properties.render_dims.h}]</td>
                    <th>Image</th>
                    <td>[{panel.properties.image_dims.w}, {panel.properties.image_dims.h}]</td>
                </tr>
                <tr>
                    <th>Canvas</th>
                    <td>[{panel.properties.base_dims.w}, {panel.properties.base_dims.h}]</td>
                    <th>Original</th>
                    <td>[{panel.properties.source_dims.w}, {panel.properties.source_dims.h}]</td>
                </tr>
                <tr>
                    <th>Status</th>
                    <td>{panel.status} {!!panel.image ? '' : '(No Image)'}</td>
                    <th>OpenCV</th>
                    <td>{!!iat.cv ? panel.properties.opencv.version : 'Not loaded'}</td>
                </tr>
                </tbody>
            </table>
        </Accordion>
    </div>
};

export default PanelInfo;