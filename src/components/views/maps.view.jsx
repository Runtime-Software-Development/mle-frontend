/*!
 * MLE.Client.Components.Views.Maps
 * File: maps.view.js
 * Copyright (c) 2026 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * View component for map features metadata.
 *
 * ---------
 * Revisions
 * - 03-01-2026  Initial version
 */

import Button from "../common/button";
import { filterStationsByBoundary } from "../tools/map.tools";
import { useRouter } from "../../providers/router.provider.client";
import { useNav } from "../../providers/nav.provider.client";
import { useEffect, useState } from "react";
import Accordion from "../common/accordion";
import EditorMenu from "../menus/editor.menu";
import NodesView from "./nodes.view";
import { getModelLabel } from "../../services/schema.services.client";
import {setNavView} from "../../services/session.services.client";
import PaginationMenu from "../menus/pagination.menu";

const FILTER_PAGE_SIZE = 25;

/**
 * Attached node data component.
 * - renders metadata attached to primary node
 * - default: metadata shown in table
 *
 * @public
 * @param {int} map_features_id
 * @return {JSX.Element}
 */

export const MapFeaturesView = ({ map_features_id }) => {

    const nav = useNav();
    const router = useRouter();
    const [stationData, setStationData] = useState([]);
    const [stations, setStations] = useState([]);
    const [count, setCount] = useState(0);
    const [pageOffset, setPageOffset] = useState(0);
    const [error, setError] = useState(null);

    // Sets the current navigation mode (tree/map/search/etc.)
    // - set in state and user session storage
    const _viewInMap = () => {
        nav.addToOverlay([map_features_id]) 
        // toggle navigator visibility
        nav.setToggle(true);
        // set navigator view
        nav.setMode('map');
        nav.setResize(true);
        setNavView('map');
    }

    const stationIds = stations
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(station => station?.nodes_id)
        .filter(Boolean);

    // API call to retrieve station data (paginated)
    useEffect(() => {

        if (stationIds.length === 0) {
            setStationData([]);
            setCount(0);
            return;
        }

        const params = {
            ids: stationIds,
            offset: pageOffset,
            limit: FILTER_PAGE_SIZE
        }

        // fetch station data
        router.post('/filter', params, true)
            .then(res => {
                if (res?.error) return setError(res.error);
                const data = res?.response?.data || {};
                setStationData(data?.results || []);
                setCount(data?.count || 0);
            })
            .catch(err => console.error(err));

    }, [stationIds, pageOffset]);

    useEffect(() => {
        if (!map_features_id) return;
        nav.addToOverlay([map_features_id]);
        setPageOffset(0);
        setStations(filterStationsByBoundary(nav.map, nav.overlay) || []);
    }, []);

    useEffect(() => {
        setPageOffset(0);
        setStations(filterStationsByBoundary(nav.map, nav.overlay) || []);
    }, [nav.overlay]);

    const hasNext = count > (pageOffset + FILTER_PAGE_SIZE);
    const hasPrev = pageOffset > 0;

    const onPrev = () => {
        setPageOffset(Math.max(0, pageOffset - FILTER_PAGE_SIZE));
    };

    const onNext = () => {
        if (hasNext) {
            setPageOffset(pageOffset + FILTER_PAGE_SIZE);
        }
    };

    // prepare item data for list
    // - set render option for each item data field
    // - return complete node item for each list element
    const loadData = () => {

        return stationData.map((item, index) => {

            const { node = {}, label = '' } = item || {};

            return <Accordion
                    key={`station_item_${index}`}
                    type={node.type}
                    id={node.id}
                    label={`${getModelLabel(node.type)}: ${label}`}
                    menu={<EditorMenu model={node.type} id={node.id} visible={['redirect']} />}
                >
                    <NodesView model={node.type} data={item} />
                </Accordion>
        });
    }

    return <>
        <Button
            icon={'map'}
            className={'submit'}
            name={'map_view'}
            label={'View on Map Tool'}
            title={'View on Map Tool'}
            onClick={() => _viewInMap()}
        />
        {stationData.length > 0 ? (
            <div>
                <h4>Stations within Map Boundary: {count}</h4>
                <PaginationMenu
                    total={count}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={onPrev}
                    onNext={onNext}
                />
                    {loadData()}
                <PaginationMenu
                    total={count}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={onPrev}
                    onNext={onNext}
                />
            </div>
        ) : (
            <p>Loading stations found within this map feature...</p>
        )}
    </>

};
