/*!
 * MLE.Client.Components.Menus.Viewer
 * File: viewer.menu.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *  * ----------
 * Description
 *
 * Viewer menu component
 *
 * ---------
 * Revisions
 * - 22-07-2023    Added new download selection button.
 * - 23-12-2023    Added new Map Object dialog for KMZ data files
 */

import React from 'react';
import {getModelLabel} from "../../services/schema.services.client";
import {useUser} from "../../providers/user.provider.client";
import {useData} from "../../providers/data.provider.client";
import {useNav} from "../../providers/nav.provider.client";
import Button from "../common/button";
import {redirect} from "../../utils/paths.utils.client";
import Dropdown from "../common/dropdown";
import {genID} from "../../utils/data.utils.client";
import {useDialog} from "../../providers/dialog.provider.client";
import styles from '../styles/menu.module.css';
import {NavigatorMenu} from "./navigator.menu";
import {useRouter} from "../../providers/router.provider.client";

/**
 *
 * View/edit options for the viewer component.
 *
 * @public
 * @return {JSX.Element}
 */

const ViewerPanelMenu = () => {
    const user = useUser();
    const nav = useNav();
    const dialog = useDialog();
    const api = useData();
    const router = useRouter();

    // get roles
    const {isAdmin=false} = user || {};

    // generate unique ID value for form inputs
    const menuID = genID();

    // sync API data
    const _handleRefresh = () => {
        nav.refresh();
        api.refresh();
    }

    return <div className={'viewer-menu'}>
        <div className={'h-menu'}>
            <ul>
                {
                    (nav.downloads || []).length > 0 &&
                    <li key={`${menuID}_menuitem_attached_downloads`}>
                        <Button
                            icon={'download'}
                            label={!nav.compact && 'Download Package'}
                            className={styles.active}
                            title={`Bulk download selected files.`}
                            onClick={() => {dialog.setCurrent({dialogID: 'bulk_download_selections'})}}
                        />
                    </li>
                }
                {
                    isAdmin && <li className={user ? 'push' : ''}>
                        <Dropdown
                            compact={nav.compact}
                            label={!nav.compact ? 'New' : ''}
                            items={[{
                                icon: 'surveyors',
                                type: 'surveyors',
                                label: `Add new ${getModelLabel('surveyors')}`,
                                callback: () => {dialog.setCurrent({dialogID: 'new_surveyor'})}
                            }, {
                                icon: 'projects',
                                type: 'projects',
                                label: `Add new ${getModelLabel('projects')}`,
                                callback: () => {dialog.setCurrent({dialogID: 'new_project'})}
                            },
                            {
                                icon: 'maps',
                                type: 'map_objects',
                                label: `Add new ${getModelLabel('map_objects')}`,
                                callback: () => {dialog.setCurrent({dialogID: 'new_map_object'})}
                            }]} />
                    </li>
                }
                <li className={'push'}>
                    <Button
                        icon={'sync'}
                        label={!nav.compact && 'Refresh'}
                        onClick={_handleRefresh}
                    />
                </li>
                <li className={user ? '' : 'push'} key={`${menuID}_menuitem_iat`}>
                    <Button
                        icon={'iat'}
                        label={!nav.compact && 'Alignment Tool'}
                        title={`Go to Alignment Tool.`}
                        onClick={() => {
                            // redirect to Alignment Tool in viewer/editor
                            redirect('/toolkit');
                        }}
                    />
                </li>
                <li key={`${menuID}_menuitem_export`}>
                    <Button
                        icon={'export'}
                        label={!nav.compact && 'Export'}
                        title={`View data export options.`}
                        onClick={() => {
                            dialog.setCurrent({dialogID: 'exporter'});
                        }}
                    />
                </li>
                <li key={`${menuID}_menuitem_help`}>
                    <Button
                        icon={'help'}
                        label={!nav.compact && 'Help'}
                        title={`View the help pages.`}
                        onClick={() => {
                            dialog.setCurrent({dialogID: 'help'});
                        }}
                    />
                </li>
                {
                    isAdmin &&
                    <li key={`${menuID}_menuitem_logs`}>
                        <Button
                            icon={'logs'}
                            label={!nav.compact && 'Admin'}
                            title={`View logs and job queue items.`}
                            onClick={() => router.update('/admin')}
                        />
                    </li>
                }
                {
                    isAdmin &&
                    <li key={`${menuID}_menuitem_options`}>
                        <Button
                            icon={'options'}
                            label={!nav.compact && 'Options'}
                            title={`Edit metadata options.`}
                            onClick={() => dialog.setCurrent({dialogID: 'options'})}
                        />
                    </li>
                }
            </ul>
        </div>
    </div>
}

/**
 * Panel menu component.
 *
 * @public
 * @return {JSX.Element}
 */

const ViewerMenu = () => {

    return <div className={'panel-menu h-menu'}>
        <ul>
            <li>
                <NavigatorMenu />
            </li>
            <li className={'push'}>
                <ViewerPanelMenu />
            </li>
        </ul>
    </div>
};

export default ViewerMenu;
