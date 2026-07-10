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
import { useEffect, useMemo, useState } from "react";
import Accordion from "../common/accordion";
import EditorMenu from "../menus/editor.menu";
import NodesView from "./nodes.view";
import { getModelLabel } from "../../services/schema.services.client";
import {setNavView} from "../../services/session.services.client";

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
    const [count, setCount] = useState(0);
    const [loadedCount, setLoadedCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
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

    const boundaryStationIds = useMemo(() => {
        const allStations = Array.isArray(nav.map) ? nav.map : [];
        const boundaryStations = filterStationsByBoundary(allStations, nav.overlay) || [];

        return [...boundaryStations]
            .sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))
            .map(station => station?.nodes_id)
            .filter(Boolean);

    }, [nav.map, nav.overlay]);

    const loadStationPage = (offset = 0, append = false, idsOverride = null) => {

        const ids = idsOverride || boundaryStationIds;

        if (append && loading) return;

        const pagedIds = ids.slice(offset, offset + FILTER_PAGE_SIZE);

        if (pagedIds.length === 0) {
            setHasMore(false);
            return;
        }

        setLoading(true);
        setError(null);

        const params = {
            ids: pagedIds,
            offset: 0,
            limit: FILTER_PAGE_SIZE
        }

        // Fetch station data in chunks and append for lazy loading.
        router.post('/filter', params, true)
            .then(res => {
                if (res?.error) return setError(res.error);

                const data = res?.response?.data || {};
                const results = data?.results || [];
                const nextLoadedCount = offset + pagedIds.length;

                setStationData(prev => append ? [...prev, ...results] : results);
                setLoadedCount(nextLoadedCount);
                setCount(ids.length);
                setHasMore(nextLoadedCount < ids.length);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    // Reset and load boundary-filtered station data whenever map or overlay state changes.
    useEffect(() => {

        const ids = boundaryStationIds;

        setStationData([]);
        setCount(ids.length);
        setLoadedCount(0);
        setHasMore(false);
        setLoading(false);
        setError(null);

        if (ids.length === 0) {
            return;
        }

        loadStationPage(0, false, ids);

    }, [boundaryStationIds]);

    useEffect(() => {
        if (!map_features_id) return;
        nav.addToOverlay([map_features_id]);
    }, []);

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
        <div className={'h-menu linked-nodes map-scope-menu'}>
            <ul>
                <li>
                    <Button
                        icon={'map'}
                        className={`${nav.boundaryFilterActive ? 'submit' : 'cancel'} map-scope-button`}
                        label={'Map: Filtered Stations'}
                        title={'Open Map Navigator with stations filtered to the selected boundary.'}
                        onClick={() => {
                            nav.setBoundaryFilterActive(true);
                            _viewInMap();
                        }}
                    />
                </li>
                <li>
                    <Button
                        icon={'stations'}
                        className={`${!nav.boundaryFilterActive ? 'submit' : 'cancel'} map-scope-button`}
                        label={'Map: Unfiltered Stations'}
                        title={'Open Map Navigator with all stations (no boundary filter).'}
                        onClick={() => {
                            nav.setBoundaryFilterActive(false);
                            _viewInMap();
                        }}
                    />
                </li>
            </ul>
        </div>
        <p className={'map-scope-note'}>Click either button to open the Map Navigator. Use Filtered to show boundary-filtered stations, or Unfiltered to show all stations.</p>
        {stationData.length > 0 ? (
            <div>
                <h4>Stations within Map Boundary: {count}</h4>
                    {loadData()}
                {
                    hasMore &&
                    <div className={'centred dialog-load-more-wrap'}>
                        <Button
                            className={'load-more-prominent'}
                            label={loading ? 'Loading...' : 'Load More'}
                            disabled={loading}
                            onClick={() => loadStationPage(loadedCount, true)}
                        />
                    </div>
                }
            </div>
        ) : (
            <p>{error || (loading ? 'Loading stations found within this map feature...' : 'No stations found within this boundary.')}</p>
        )}
    </>

};
