/*!
 * MLE.Client.Components.Tools.Pagination
 * File: paginate.tools.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from "react";
import { genID } from '../../utils/data.utils.client';
import MetadataView from '../views/metadata.view';
import { getModelLabel } from '../../services/schema.services.client';
import Accordion from '../common/accordion';
import PaginationMenu from '../menus/pagination.menu';
import { useRouter } from '../../providers/router.provider.client';
import { createRoute } from '../../utils/paths.utils.client';

/**
 * Paginate results component.
 *
 * @public
 * @param {Array} data
 * @return {JSX.Element}
 */

const PaginationTools = ({data}) => {

    const router = useRouter();

    // Generate unique key for listed items
    const keyID = genID();

    let {query='', offset=0, limit=10, results=[], count=0} = data || {};
    limit = parseInt(String(limit));
    offset = parseInt(String(offset));

    // create search data state
    const [searchOffset, setSearchOffset] = React.useState(offset);

    // handle previous page request
    const onPrev = () => {
        const updatedOffset = searchOffset - limit
        setSearchOffset(updatedOffset);
        const params = {
            ids: query,
            offset: updatedOffset,
            limit: limit
        }
        router.update(createRoute('/filter', params));
    }

    // handle next page request
    const onNext = () => {
        const updatedOffset = limit + searchOffset
        setSearchOffset(updatedOffset);
        const params = {
            ids: query,
            offset: updatedOffset,
            limit: limit
        }
        router.update(createRoute('/filter', params));
    }

    // prepare item data for list
    // - set render option for each item data field
    // - return complete node item for each list element
    const filterItems = () => {

        return results.map((item, index) => {

            const {node={}, metadata={}, label=''} = item || {};

            return  <li key={`${keyID}_item_${index}`}>
                        <Accordion
                            type={node.type}
                            id={node.id}
                            label={`${getModelLabel(node.type)}: ${label}`}
                        >
                            <MetadataView node={node} model={node.type} metadata={metadata} />
                        </Accordion>
                    </li>
        });
    }

    const hasNext = count >= searchOffset + limit;
    const hasPrev = 0 < searchOffset;

    return <>
        <h4>{ results.length > 0 &&`Results found: ${count}` }</h4>
        <PaginationMenu
            total={count}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={onPrev}
            onNext={onNext}
        />
        {
            count > 0
            ? <ol className={'items'} start={offset + 1}>
                {
                    filterItems()
                }
            </ol>
            : <p>No Results.</p>
        }
        <PaginationMenu
            total={count}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={onPrev}
            onNext={onNext}
        />
    </>
}

export default PaginationTools;
