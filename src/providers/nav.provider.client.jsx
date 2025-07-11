/*!
 * MLE.Client.Providers.Navigation
 * File: nav.provider.client.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * Description
 * Navigation provider is a React Context used to store and share data for the navigator.
 *
 * Revisions
 * - 30-11-2023   Add map features overlay filter data to map navigation provider
 */

import * as React from 'react'
import { useRouter } from './router.provider.client';
import {
    getDownloads,
    addDownload,
    checkDownload,
    clearDownloads,
    getNavView,
    removeDownload
} from "../services/session.services.client";

/**
 * Global navigation data provider.
 *
 * @public
 */

const NavContext = React.createContext({});

/**
 * Provider component to allow consuming components to subscribe to
 * API request handlers.
 *
 * @public
 * @param {Object} props
 */

function NavProvider(props) {

    const router = useRouter();

    // tree and map data states
    const [nodeData, setNodeData] = React.useState({});
    const [statsData, setStatsData] = React.useState([]);
    // map data
    const [mapData, setMapData] = React.useState({});
    // filter data for map station pins
    const [filterData, setFilterData] = React.useState({});
    // data for map boundary overlays
    const [mapOverlayData, setMapOverlayData] = React.useState(null);
    // filter data for map station pins
    // const [filterOverlayData, setFilterOverlayData] = React.useState({});
    const [selectedNode, setSelectedNode] = React.useState({});
    const [scrollToView, setScrollToView] = React.useState(false);
    const [compact, setCompact] = React.useState(false);

    // IAT data states
    const [iatSettings, setIATSettings] = React.useState(null);

    // Attached downloads
    const [downloadData, setDownloadData] = React.useState(null);

    // initialize navigation view settings
    const [navView, setNavView] = React.useState(getNavView() || 'map');
    const [navToggle, setNavToggle] = React.useState(true);
    const [navExpand, setNavExpand] = React.useState(false);

    // navigator resize signal
    const [resize, setResize] = React.useState(false);

    // navigator data loading error
    const [error, setError] = React.useState(false);

    // Addresses: Can't perform a React state update on unmounted component.
    // This is a no-op, but it indicates a memory leak in your
    // application. To fix, cancel all subscriptions and
    // asynchronous tasks in a useEffect cleanup function.
    const _isMounted = React.useRef(false);

    // refresh navigator data
    const _refresh = () => {
        setNodeData(null);
        setMapData(null);
    }

    // scroll to current tree node
    const _handleScroll = (toggle) => {
        setScrollToView(toggle);
    }

    // toggle selected download
    const _toggleAttachedDownload = (id) => {
        checkDownload(id) ? removeDownload(id) : addDownload(id);
        setDownloadData(getDownloads());
    }

    // clear all attached downloads
    const _clearAttachedDownloads = () => {
        clearDownloads();
        setDownloadData(null);
    }

    // clear all attached downloads
    const _checkAttachedDownload = (id) => {
        return checkDownload(id);
    }

    // set features to map overlay (map feature node IDs)
    const _setMapOverlay = (data) => {
        setMapOverlayData(data);
    }

    // add a feature to map overlay (map feature node IDs)
    const _addToMapOverlay = (ids) => {

        // check if map feature already added
        if ((mapOverlayData || []).some(feature => ids.includes(feature.id))) {
            setMapOverlayData((mapOverlayData || []).concat([]));
        }

        // get filtered map features
        const _filterFeatures = (data) => {
            return (data || []).map((data) => {
                const {nodes_id, owner_id, name, description, type, geometry, map_object_name, dependents} = data || {};
                return {
                    id: nodes_id,
                    selected: (ids || []).length === 1,
                    geoJSON: geometry.map(featureGeometry => {
                        return {
                            type: 'Feature',
                            geometry: featureGeometry,
                            properties: {
                                name: name,
                                description: description,
                                type: type,
                                owner: map_object_name,
                                owner_id: owner_id,
                                dependents: dependents
                            }
                        };
                    })
                };
            });
        }

        // API call to retrieve map features data
        router.get('/map/features?ids=' + ids.join('+'))
            .then(res => {
                // update state with response data
                if (_isMounted.current) {
                    if (res.error) return setError(res.error);
                    const { response = {} } = res || {};
                    const { data = {} } = response || {};
                    const filteredFeatures = _filterFeatures(data);
                    setMapOverlayData(filteredFeatures);
                }
            })
            .catch(console.error);
    }

    /**
     * Update download selection state.
     *
     * @public
     */

    React.useEffect(() => {
        setDownloadData(getDownloads());
    }, []);

    /**
     * Load API global node tree data.
     *
     * @public
     */

    // API call to retrieve node tree top level
    React.useEffect(() => {
        _isMounted.current = true;
        // proceed if:
        // - no error found (e.g. empty response)
        // - navigator route is defined
        // - node data not yet loaded
        if (!error && (!nodeData || Object.keys(nodeData).length === 0)) {
            console.log('Loading Nav Tree...')
            // load API data
            router.get('/nodes/tree')
                .then(res => {

                    if (_isMounted.current) {

                        // destructure map data
                        if (res.error) return setError(res.error);
                        const {response={} } = res || {};
                        const { data = {} } = response || {};
                        const { nodes={}, stats=[] } = data || {};

                        // [DEBUG]
                        console.log('\n<<< Nav [Tree] >>>\n', res)

                        // check if response data is empty (set error flag if true)
                        if ( Object.keys(nodes).length === 0 ) {
                            return setError(true);
                        }

                        // load node data to provider
                        setNodeData(nodes);
                        setStatsData(stats);
                    }
                })
                .catch(err => console.error(err));
        }
        return () => {_isMounted.current = false;};
    }, [router, nodeData, setNodeData, error, setError]);

    /**
     * Load API global station pin map data.
     *
     * @public
     */

    React.useEffect(() => {
        _isMounted.current = true;

        // proceed if:
        // - no error found (e.g. empty response)
        // - navigator route is defined
        // - node data not yet loaded
        if (!error && (!mapData || Object.keys(mapData).length === 0)) {
            console.log('Loading Nav Map...')
            // load API data
            router.get('/nodes/map')
                .then(res => {

                    if (_isMounted.current) {

                        // destructure map data
                        if (res.error) return setError(res.error);
                        const {response={} } = res || {};
                        const { data = {} } = response || {};
                        const { nodes={} } = data || {};

                        // DEBUG
                        // console.log('\n<<< Nav [Map] >>>\n', res)

                        // check if response data is empty (set error flag if true)
                        if ( Object.keys(nodes).length === 0 ) {
                            return setError(true);
                        }

                        // load node data to provider
                        setMapData(nodes);
                    }
                })
                .catch(err => console.error(err));
        }
        return () => {_isMounted.current = false;};
    }, [router, mapData, setMapData, error, setError]);

    return (
        <NavContext.Provider value={
            {
                error,
                refresh: _refresh,
                tree: nodeData,
                map: mapData,
                iat: iatSettings,
                setIAT: setIATSettings,
                stats: statsData,
                selected: selectedNode,
                setSelected: setSelectedNode,
                filter: filterData,
                overlay: mapOverlayData,
                setOverlay: _setMapOverlay,
                addToOverlay: _addToMapOverlay,
                setFilter: setFilterData,
                hasFilter: Object.keys(filterData).length > 0,
                mode: navView,
                setMode: setNavView,
                expand: navExpand,
                setExpand: setNavExpand,
                scrollToView: scrollToView,
                scroll: _handleScroll,
                toggle: navToggle,
                setToggle: setNavToggle,
                resize: resize,
                setResize: setResize,
                compact,
                setCompact,
                downloads: downloadData,
                addDownload: _toggleAttachedDownload,
                checkDownload: _checkAttachedDownload,
                clearDownloads: _clearAttachedDownloads
            }
        } {...props} />
    )
}

const useNav = () => React.useContext(NavContext);
export { useNav, NavProvider };
