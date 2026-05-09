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
import { use, useEffect, useState } from "react";
import Accordion from "../common/accordion";
import EditorMenu from "../menus/editor.menu";
import NodesView from "./nodes.view";
import { createRoute } from "../../utils/paths.utils.client";
import { getModelLabel } from "../../services/schema.services.client";
import {setNavView, setPref} from "../../services/session.services.client";

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

    // API call to retrieve station data
    useEffect(() => {

        if (stations.length === 0) return;
        const params = {
            ids: stations
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(station => station?.nodes_id),
            offset: 0,
            limit: 1000
        }
        // fetch station data
        router.get(createRoute('/filter', params))
            .then(res => {
                if (res?.error) return setError(res.error);
                console.log('Station data response:', res?.response?.data);
                setStationData(res?.response?.data?.results || []);
            })
            .catch(err => console.error(err));

    }, [stations]);

    useEffect(() => {
        if (!map_features_id) return;
        nav.addToOverlay([map_features_id]);
        setStations(filterStationsByBoundary(nav.map, nav.overlay) || []);
    }, []);

    useEffect(() => {
        setStations(filterStationsByBoundary(nav.map, nav.overlay) || []);
    }, [nav.overlay]);

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
            label={'View on Map'}
            title={'View on Map'}
            onClick={() => _viewInMap()}
        />
        {stationData.length > 0 ? (
            <div>
                <h4>Stations within Map Boundary:</h4>
                    {loadData()}
            </div>
        ) : (
            <p>Loading stations found within this map feature...</p>
        )}
    </>

};
