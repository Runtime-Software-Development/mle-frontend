/*!
 * MLE.Client.Components.Selectors.Views
 * File: view.selector.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import NodeSelector from './node.selector';
import NotfoundError from '../error/notfound.error';
import ServerError from '../error/server.error';
import { useData } from '../../providers/data.provider.client';
import { getRenderType } from '../../services/schema.services.client';
import PaginationTools from '../tools/pagination.tools';
import AccessError from '../error/access.error';
import Loading from "../common/loading";

/**
 * Filter requested data view by render type.
 *
 * @public
 */

const ViewSelector = () => {

    const api = useData();

    // select render type and schema
    const render = getRenderType(api.view, api.model);

    // rendered view components indexed by render type
    const renders = {
        // render a node view
        nodes: () => <NodeSelector model={api.model} data={api.data} />,
        // render paginated results
        filter: () => <PaginationTools data={api.data} />,
        // render page not found page
        404: () => <NotfoundError />,
        notFound: () => <NotfoundError />,
        // render not authorized page
        401: () => <AccessError />,
        403: () => <AccessError />,
        // render server error page
        500: () => <ServerError />,
        serverError: () => <ServerError />
    }

    // render data view
    return (
        <>
            {
                !render && <Loading />
            }
            {
                render && renders.hasOwnProperty(render)
                    ? renders[render]() : <NotfoundError />
            }
        </>
    )
}

export default React.memo(ViewSelector);
