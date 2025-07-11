/*!
 * MLE.Client.Components.Menus.Header
 * File: header.menu.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import {
    getModelLabel,
    getStaticLabel, getStaticView,
    getViewLabel,
} from '../../services/schema.services.client';
import { useRouter } from '../../providers/router.provider.client';
import { useData } from '../../providers/data.provider.client';
import Badge from '../common/badge';
import EditorMenu from "./editor.menu";
import {capitalize} from "../../utils/data.utils.client";

/**
 * Render view heading component.
 *
 * @public
 */

const HeaderMenu = () => {

    const router = useRouter();
    const api = useData();
    const omitHeadings = ['imageToolkit'];

    // get possible heading labels
    const staticView = getStaticView(router.route);
    const staticLabel = getStaticLabel(router.route);
    const nodeLabel = api.label;
    const modelLabel = getModelLabel(api.model);

    // generate heading based on current model/view
    const genHeading = (pageTitle=false) => {

        // omit header for select pages
        if (omitHeadings.includes(staticView) && !pageTitle) return null;

        // use static label (if exists)
        if (staticLabel) return staticLabel;

        const headings = {
            notFound: getStaticLabel('/not_found'),
            404: 'Not Found',
            show: nodeLabel,
            filter: `${getViewLabel('filter')} Stations`,
            default: `${getViewLabel(api.view)}: ${modelLabel}`
        }

        // set page header
        return headings.hasOwnProperty(api.view) ? headings[api.view] : '';
    }

    // generate heading text
    const headingText = genHeading();


    // expand node metadata to pass to menu
    const { file_size=0, mimetype='', filename='' } = api.file || {};
    let itemMetadata = api.metadata || {};
    // include file metadata in details
    itemMetadata.filename = filename;
    itemMetadata.file_size = file_size;
    itemMetadata.mimetype = mimetype;

    return <div className={'heading h-menu'}>
        {
            // Page Header
            headingText &&
            <ul>
                {
                    api.model &&
                    <li>
                        <Badge
                            className={`node_type ${api.status || api.model}`}
                            icon={api.model}
                            title={`${modelLabel}${api.status ? ' [' + capitalize(api.status) + ']' : ''}`}
                            label={modelLabel}
                        />
                    </li>
                }
                <li><h3>{genHeading()}</h3></li>
                {
                    api.model && <li className={'push'}>
                        <EditorMenu
                            id={api.id}
                            label={headingText}
                            model={api.model}
                            node={api.node}
                            metadata={itemMetadata}
                            owner={api.owner}
                            files={api.files}
                            attached={api.attached}
                        />
                    </li>
                }
            </ul>
        }
    </div>
}

export default HeaderMenu;
