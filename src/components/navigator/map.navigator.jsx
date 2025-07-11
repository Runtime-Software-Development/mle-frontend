/*!
 * MLE.Client.Components.Navigator.Map
 * File: map.navigator.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Map navigator component. Leaflet-based interactive map. Use third-party tile layer
 * See: https://leaflet-extras.github.io/leaflet-providers/preview/
 *
 * ---------
 * Revisions

 */

import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from '../../providers/router.provider.client';
import { useData } from '../../providers/data.provider.client';
import {createNodeRoute, createRoute} from '../../utils/paths.utils.client';
import {debounce, useWindowSize} from '../../utils/events.utils.client';
import Loading from "../common/loading";
import {getPref, setPref} from "../../services/session.services.client";
import {useNav} from "../../providers/nav.provider.client";
import {getMarker, getBaseLayers, setFeaturePopup} from "../tools/map.tools";
import Button from "../common/button";
import 'leaflet-kml/L.KML.js';
import {convertCoordDMS} from "../../utils/data.utils.client";
import {useDialog} from "../../providers/dialog.provider.client";


// change default marker icon
delete L.Icon.Default.prototype._getIconUrl;
const iconSVG = getMarker(1);

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'data:image/svg+xml;base64,' + btoa(iconSVG),
    iconUrl: 'data:image/svg+xml;base64,' + btoa(iconSVG),
    shadowUrl: null,
    shadowSize:  [0, 0]
});

/**
 * Page height offset
 */
const heightOffset = 140;

/**
 * Initial map centre coordinate
 */
const initCentre = {lat: 51.311809, lng: -119.249230};

/**
 * Default base layer
 */
const defaultBaseLayer = 'Satellite Imagery';

/**
 * Map navigator component.
 * - Requires third-party tile layer
 *   (See: https://leaflet-extras.github.io/leaflet-providers/preview/)
 *
 * @public
 * @return {JSX.Element}
 */

function MapNavigator({ filter, hidden }) {

    // let mapContainer = React.createRef();
    const mapID = 'map-container';
    const router = useRouter();
    const api = useData();
    const nav = useNav();
    const dialog = useDialog();

    // mounted component flag
    const _isMounted = React.useRef(false);

    // get the current node ID (if available)
    const { query = [] } = api.data || {};
    const currentFilter = query.length > 0 ? query : api.nodes;

    // centre map on selected node (use local coordinates, if available)
    const { lat=initCentre.lat, lng=initCentre.lng } = api.location;

    // map initial settings
    const [loaded, setLoaded] = React.useState(false);
    const [selectedBaseLayer, setBaseLayer] = React.useState(getPref('mapBase') || defaultBaseLayer);
    const [center, setCenter] = React.useState([lat, lng]);
    const [zoom, setZoom] = React.useState(4);
    const [clustered, setClustered] = React.useState(true);
    const [showMarkers, setShowMarkers] = React.useState(true);
    const [stale, setStale] = React.useState(true);

    // window dimensions
    const [winWidth, winHeight] = useWindowSize();

    // leaflet map objects (references)
    const mapPane = React.useRef(null);
    const mapObj = React.useRef(null);
    const stationMarkers = React.useRef(null);
    const mapFeatures = React.useRef(null);

    // refresh map tiles and  data
    const _handleRefresh = () => {
        const baseLayers = getBaseLayers(L);
        baseLayers[selectedBaseLayer].addTo(mapObj.current);
        setStale(true);
    };

    // toggle markers as clustered
    const _handleCluster = () => {
        setClustered(!clustered)
    };

    // toggle markers display
    const _handleMarkers = () => {
        setShowMarkers(!showMarkers)
    };

    // select map features overlay
    const _handleMapFeatures = () => {
        dialog.setCurrent({
            dialogID: 'map_features',
            callback: (data) => {
                nav.setOverlay(data)
                dialog.cancel();
            }
        });
    };

    // request station(s) view in selected cluster
    // - if single station, go to that station info page
    // - for multiple station, go to filter page for ids
    const loadStations = React.useCallback((ids = []) => {
        ids.length === 1
            ? router.update(createNodeRoute('stations', 'show', ids[0]))
            : router.update(createRoute('/filter', { ids: ids }));
    }, [router]);

    // show metadata for item in view panel
    const loadViewPane = React.useCallback((id, model) => {
        router.update(createNodeRoute(model, 'show', id));
    }, [router]);

    // cluster station locations for n > 1
    const getClusterMarkers = React.useCallback((currentIDs) => {

        if (!currentIDs || !showMarkers) return;

        // apply user-defined filter
        const _applyFilter = (station) => {

            // filter is empty
            if (Object.keys(nav.filter).length === 0) return true;

            // apply data field filters - include stations that:
            // - have the filter property
            // - either have an empty filter property or match in value
            return Object.keys(nav.filter).reduce((o, key) => {
                return o && station.hasOwnProperty(key)
                    && (
                        !nav.filter[key]
                        || parseInt(station[key]) === parseInt(nav.filter[key])
                        || station[key] === nav.filter[key]
                    );
            }, true);
        };

        // create map marker icon
        const _getMarker = (n, cluster) => {

            // select marker icon based on cluster count value 'n'
            const iconSVG = getMarker(n, cluster);

            return n > 1
                ? L.icon({
                    iconUrl: 'data:image/svg+xml;base64,' + btoa(iconSVG),
                    iconSize: [50, 50],
                    iconAnchor: [25, 50],
                    tooltipAnchor: [10, 0]
                })
                : L.icon({
                    iconUrl: 'data:image/svg+xml;base64,' + btoa(iconSVG),
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    tooltipAnchor: [10, 0]
                });
        };

        // grid settings: number of grid cells is scaled by zoom level
        // - increase granularity exponentially
        const latN = Math.ceil(0.2 * zoom * zoom * zoom);
        const lngN = Math.ceil(0.2 * zoom * zoom * zoom);

        // get map parameters
        // NOTE: The following bucket sort of geographic coordinates
        // only works for one side of the international date line.
        const maxBounds = [[66, -104], [44, -154]];
        const viewBounds = mapObj.current.getBounds();
        const paddedViewBounds = viewBounds.pad(1.0);

        // Latitude: North > South (northern hemisphere)
        // Longitude: East > West (northern hemisphere)
        const [[latMax, lngMax], [latMin, lngMin]] = maxBounds;

        // get latitude/longitude range
        const latRange = latMax - latMin;
        const lngRange = lngMax - lngMin;

        let dLat, dLng, grid;
        if (latN > 0 && lngN > 0) {
            dLat = latRange / latN;
            dLng = lngRange / lngN;

            // initialize cluster grid
            grid = [...Array(latN).keys()].map(() => Array(lngN));
        }

        // filter stations outside (padded) map view
        const FilteredData = (nav.map || [])
            .filter(station => {
                // filter stations not in map view
                const coord = L.latLng(station.lat, station.lng);
                // apply user-defined filter
                return paddedViewBounds.contains(coord) && _applyFilter(station);
            });

        // Sort station coordinates into grid areas
        // - check if grid exists and apply
        // - otherwise use single station markers
        const clusters = clustered ?
            // bucket sort station locations into grid elements
            FilteredData.reduce((o, station) => {

                const i = Math.round((station.lat - latMin) / dLat);
                const j = Math.round((station.lng - lngMin) / dLng);

                // reject null grid elements
                if (!o || isNaN(i) || o[i] == null) return o;

                // create longitudinal array if none exists
                if (o[i][j] == null) {
                    o[i][j] = {
                        isSelected: false,
                        stations: [],
                        centroid: { lat: 0, lng: 0 },
                    };
                }
                o[i][j].isSelected = o[i][j].isSelected || currentIDs.includes(station.nodes_id);
                o[i][j].stations.push(station);
                o[i][j].centroid.lat += station.lat;
                o[i][j].centroid.lng += station.lng;
                return o;
            }, grid)
            : // (no clustering) show individual station markers
            FilteredData.reduce((o, station) => {
                o.push([{
                    isSelected: station.isSelected || currentIDs.includes(station.nodes_id),
                    stations: [station],
                    centroid: {
                        lat: station.lat,
                        lng: station.lng
                    }
                }]);
                return o;
            }, []);

        // generate cluster marker for each grid element
        return clusters.reduce((o, row) => {
            row.map(cluster => {
                // get number of stations in cluster
                const n = cluster.stations.length;
                // place cluster in centroid of grid element
                const centroid = [
                    cluster.centroid.lat / n,
                    cluster.centroid.lng / n,
                ];
                // set z-index of marker (selected has higher index)
                const zIndexOffset = cluster.isSelected ? 999 : 0;

                // create marker using station coordinates
                const marker = L.marker(centroid, {
                    icon: _getMarker(n, cluster),
                    zIndexOffset: zIndexOffset,
                    riseOnHover: true,
                })
                    .on('click', () => {
                        // clicking on marker loads filter results in data pane
                        debounce(() => {
                            loadStations(
                                cluster.stations.map(station => {return station.nodes_id})
                            );
                            // recenter map
                            //const coord = e.latlng;
                            //if (mapObj.current) mapObj.current.panTo(coord);
                        }, 400)();
                    })
                    .on('dblclick', (e) => {
                        const coord = e.latlng;
                        const zoomLevel = mapObj.current.getZoom() + 1;
                        mapObj.current.flyTo(coord, zoomLevel);
                    })
                    .on('mouseover', function () {
                        // show station name and location on clusters where n < 15
                        this.bindTooltip(`${
                            n <= 15
                                ? cluster.stations.map(station => {
                                    // convert DMS to degrees / minutes / seconds
                                    return `<strong>${station.name}</strong> [${convertCoordDMS(station.lat)}, ${convertCoordDMS(station.lng)}]`
                                }).join('<br>')
                                : `<strong>Cluster (n = ${n})</strong><br />
                                    Lat: ${convertCoordDMS(centroid[0])}<br />
                                    Lng: ${convertCoordDMS(centroid[1])}`
                        }`).openTooltip();
                    })
                    .on('mouseout', function () {
                        this.closeTooltip();
                    });
                // add cluster marker to layer
                o.push(marker);
                return null;
            }, o);
            return o;
        }, []);
    }, [nav, mapObj, loadStations, zoom, clustered, showMarkers]);

    /**
     * Reset map view to new center coordinate and zoom level.
     * - Redraws markers based on new center and zoom values
     *
     * @param coord
     * @param zoomLevel
     * @type {function(*=, *=): void}
     */

    const reset = React.useCallback((coord, zoomLevel) => {
        if (coord && zoomLevel && stationMarkers.current) {
            setCenter(coord);
            setZoom(zoomLevel);
        }
    }, [setZoom, setCenter]);

    // assign selected nodes on map
    React.useEffect(() => {
        _isMounted.current = true;
        if (_isMounted.current && mapObj.current && stationMarkers.current) {
            stationMarkers.current.clearLayers();
            stationMarkers.current = L.layerGroup(getClusterMarkers(currentFilter)).addTo(mapObj.current);
        }
        return () => {_isMounted.current = false;}
    }, [getClusterMarkers, currentFilter, filter, showMarkers, zoom, center])

    // assign selected nodes on map
    React.useEffect(() => {

        const geojsonMarkerOptions = {
            radius: 8,
            fillColor: "skyblue",
            color: "#FFF",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.5
        };

        _isMounted.current = true;

        if (_isMounted.current && mapObj.current && mapFeatures.current) {
            // clear current map features
            mapFeatures.current.clearLayers();
            // include selected map features as layers added to group (geoJSON)
            if (Array.isArray(nav.overlay) && nav.overlay.length > 0) {
                nav.overlay.forEach(({id, geoJSON, selected}) => {
                    let selectedLayer;
                    const featureLayer = L.geoJSON(geoJSON, {
                        onEachFeature: (feature, layer)=>{
                            selectedLayer = layer;
                            setFeaturePopup(id, feature, layer, loadViewPane);
                        },
                        pointToLayer: function (feature, latlng) {
                            return L.circleMarker(latlng, geojsonMarkerOptions);
                        }
                    });
                    mapFeatures.current.addLayer(featureLayer);
                    // show pop-up of selected feature
                    if (!!selected) {
                        selectedLayer.openPopup();
                        const bounds = featureLayer.getBounds();
                        mapObj.current.fitBounds(bounds);
                    }
                });
                // For multiple selected map features: adjust map bounds to show group
                if (nav.overlay.length > 1) {
                    const bounds = mapFeatures.current.getBounds();
                    mapObj.current.fitBounds(bounds);
                }
            }
        }
        return () => {_isMounted.current = false;}
    }, [nav.overlay, loadViewPane])

    // API data change detected: recenter map to selected coordinate (if available)
    // - if on station info page, center and zoom to location on the map
    React.useEffect(() => {
        _isMounted.current = true;
        if (_isMounted.current && mapObj.current) {
            const {lat = null, lng = null} = api.location;
            if (lat && lng && mapObj.current) {
                // recentre and fly-to location if not zoomed in
                // console.log('zoom level', mapObj.current.getZoom());
                if (mapObj.current.getZoom() < 8) {
                    mapObj.current.flyTo([lat, lng], 8);
                    setClustered(false);
                }
            }
        }
        return () => {_isMounted.current = false;}
    }, [api.location, setClustered])

    // Redraw map if container was resized.
    React.useEffect(() => {
        _isMounted.current = true;
        if (_isMounted.current && mapObj.current) {
            mapObj.current.invalidateSize();
        }
        return () => {
            _isMounted.current = false;
            nav.setResize(false);
        }
    }, [nav.resize, winWidth, winHeight]);


    /**
     * Initialize leaflet map.
     *
     * @param domNode
     * @param mapCenter
     * @param mapZoom
     * @type {function(*=, *=, *=): (undefined)}
     */

    const initMap = React.useCallback((domNode) => {

        // adjust height to fill window
        domNode.style.height = window.innerHeight - heightOffset + 'px';

        if (api.loaded && center && zoom && nav.map && Object.keys(nav.map).length > 0) {

            // exit initialization if map already exists
            if (mapObj.current) return;

            // centre map on selected node
            const [lat=initCentre.lat, lng=initCentre.lng] = Array.isArray(center)
                ? center
                : [center.lat || '', center.lng || ''];

            // retrieve base tile layers
            const baseLayers = getBaseLayers(L);

            // initialize map with DOM container and initial coordinates
            mapObj.current = L.map(domNode, {
                center: [lat, lng],
                zoom: zoom,
                layers: [baseLayers[selectedBaseLayer || defaultBaseLayer]],
            });

            // set maximum bounds to map view
            // mapObj.current.setMaxBounds(maxBounds);

            // reset saved map centre coordinate / zoom level
            reset(center, zoom);

            // add station marker layer group to map
            stationMarkers.current = L.layerGroup(getClusterMarkers(currentFilter)).addTo(mapObj.current);

            // add map features layer group to map
            mapFeatures.current = new L.FeatureGroup().addTo(mapObj.current);

            // add layers to leaflet tools
            L.control.layers(baseLayers).addTo(mapObj.current);
            L.control.scale().addTo(mapObj.current);

            // callback for base layer changes
            // save as user preference
            mapObj.current.on('baselayerchange', e => {
                setBaseLayer(e.name);
                setPref('mapBase', e.name);
            });

            // create callbacks for map zooming / panning
            mapObj.current.on('zoomend', e => {
                // reset saved map centre coordinate / zoom level
                reset(e.target.getCenter(), e.target.getZoom());
            });
            mapObj.current.on('moveend', e => {
                reset(e.target.getCenter(), e.target.getZoom());
            });
            mapObj.current.on('error', err => {
                console.warn(err);
            });

            setLoaded(true);
            setStale(false);
        }

    }, [
        api.loaded,
        nav,
        currentFilter,
        center,
        zoom,
        reset,
        selectedBaseLayer,
        setBaseLayer,
        setStale,
        getClusterMarkers,
        setLoaded
    ]);

    /**
     * Initialize map using reference callback to access DOM container.
     *x
     * @param domNode
     * @type {function(*=): void}
     */

    const mapContainer = React.useCallback(domNode => {
        if (domNode && stale) initMap(domNode);
    }, [initMap, stale]);

    return (
        <div
            ref={mapPane}
            className={'map'}
            style={{
                display: hidden ? ' none' : ' block',
                height: (winHeight - heightOffset) + 'px'
            }}
        >
            {
                !loaded && <Loading/>
            }
            <div
                id={mapID}
                className={mapID}
                ref={mapContainer}
                style={{
                    height: (winHeight - heightOffset) + 'px'
                }}
            />
            {nav.toggle && <div className={'map-menu'}>
                {/*<Button*/}
                {/*    icon={'sync'}*/}
                {/*    size={'lg'}*/}
                {/*    onClick={_handleRefresh}*/}
                {/*/>*/}
                <Button
                    icon={'stations'}
                    size={'lg'}
                    label={'Stations'}
                    className={showMarkers ? 'activated' : ''}
                    onClick={_handleMarkers}
                />
                {
                    showMarkers && <Button
                        icon={'clustered'}
                        size={'lg'}
                        label={'Cluster'}
                        className={clustered ? 'activated' : ''}
                        onClick={_handleCluster}
                    />
                }
                <Button
                    icon={'boundaries'}
                    size={'lg'}
                    label={'Features'}
                    className={(nav.overlay || []).length > 0 ? 'activated' : ''}
                    onClick={_handleMapFeatures}
                />
            </div>}
        </div>
    );
}

export default MapNavigator;