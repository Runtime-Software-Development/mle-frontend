/*!
 * MLE.Client.Components.Tools.Pagination
 * File: paginate.tools.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

import React from "react";
import { genID } from '../../utils/data.utils.client';
import { getModelLabel } from '../../services/schema.services.client';
import Accordion from '../common/accordion';
import PaginationMenu from '../menus/pagination.menu';
import { useRouter } from '../../providers/router.provider.client';
import NodesView from "../views/nodes.view";

/**
 * Paginate results component.
 *
 * @param {Object} data - object with properties:
 *   - query: search query string
 *   - offset: starting index for pagination
 *   - limit: number of items to display per page
 *   - results: array of node data objects
 *   - count: total number of items matching query
 * @return {JSX.Element} - paginated list of items
 */
const PaginationTools = ({data}) => {

    const router = useRouter();

    // Generate unique key for listed items
    const keyID = genID();

    let {query='', offset=0, limit=10, results=[], count=0} = data || {};
    limit = parseInt(String(limit));
    offset = parseInt(String(offset));

    const [pageData, setPageData] = React.useState({
        query,
        offset,
        limit,
        results,
        count
    });

    React.useEffect(() => {
        setPageData({
            query,
            offset,
            limit,
            results,
            count
        });
    }, [query, offset, limit, results, count]);

    const fetchPage = (updatedOffset) => {
        const params = {
            ids: pageData.query,
            offset: updatedOffset,
            limit: pageData.limit
        };

        router.post('/filter', params, true)
            .then(res => {
                if (res?.error) return;
                const responseData = res?.response?.data || {};
                setPageData(prev => ({
                    ...prev,
                    offset: updatedOffset,
                    results: responseData?.results || [],
                    count: responseData?.count ?? prev.count
                }));
            })
            .catch(err => console.error(err));
    };

    // handle previous page request
    const onPrev = () => {
        const updatedOffset = Math.max(pageData.offset - pageData.limit, 0);
        fetchPage(updatedOffset);
    }

    // handle next page request
    const onNext = () => {
        const updatedOffset = pageData.offset + pageData.limit;
        fetchPage(updatedOffset);
    }

    // prepare item data for list
    // - set render option for each item data field
    // - return complete node item for each list element
    const filterItems = () => {

        return pageData.results.map((item, index) => {

            const {node={}, label=''} = item || {};

            return  <li key={`${keyID}_item_${index}`}>
                        <Accordion
                            type={node.type}
                            id={node.id}
                            label={`${getModelLabel(node.type)}: ${label}`}
                        >
                            {/* <MetadataView node={node} model={node.type} metadata={metadata} /> */}
                            <NodesView  model={node.type} data={item} />
                        </Accordion>
                    </li>
        });
    }

    const hasNext = pageData.count > (pageData.offset + pageData.limit);
    const hasPrev = pageData.offset > 0;

    return <>
        <h4>{ pageData.results.length > 0 &&`Results found: ${pageData.count}` }</h4>
        <PaginationMenu
            total={pageData.count}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={onPrev}
            onNext={onNext}
        />
        {
            pageData.count > 0
            ? <ol className={'items'} start={pageData.offset + 1}>
                {
                    filterItems()
                }
            </ol>
            : <p>No Results.</p>
        }
        <PaginationMenu
            total={pageData.count}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={onPrev}
            onNext={onNext}
        />
    </>
}

export default PaginationTools;
