/*!
 * MLE.Client.Components.Tools.Map
 * File: selector.tools.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Support utilities for the map navigation tool (Leaflet).
 *
 * ---------
 * Revisions

 */


/**
 * Create base tile layers for Leaflet map
 * References:
 *  - ARCGIS <https://services.arcgisonline.com/arcgis/rest/services>
 *  - OpenStreetMap <https://www.openstreetmap.org>
 *  - Leaflet Providers <http://leaflet-extras.github.io/leaflet-providers/preview/index.html>
 *
 * @public
 * @return object
 */

export const getBaseLayers = (L) => {
    return {
        'Street Map': L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                maxZoom: 17,
                minZoom: 4,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                keepBuffer: 3,
            }),
        'World Map': L.tileLayer(
            'https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
            {
                maxZoom: 17,
                minZoom: 4,
                attribution: '&copy; <a href="https://www.arcgisonline.com/copyright">ARCGIS</a> contributors',
                keepBuffer: 3,
            }),
        'Satellite Imagery': L.tileLayer(
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            {
                maxZoom: 17,
                minZoom: 4,
                attribution: '&copy; <a href="https://www.arcgisonline.com/copyright">ARCGIS</a> contributors',
                keepBuffer: 3,
            }),
        'Topological 1': L.tileLayer(
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
            {
                maxZoom: 17,
                minZoom: 4,
                attribution: '&copy; <a href="https://www.arcgisonline.com/copyright">ARCGIS</a> contributors',
                keepBuffer: 3,
            }),
        'Topological 2': L.tileLayer(
            'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            {
                maxZoom: 17,
                minZoom: 4,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                keepBuffer: 3,
            }),
        'Terrain Base': L.tileLayer(
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
            {
                maxZoom: 17,
                minZoom: 4,
                attribution: '&copy; <a href="https://www.arcgisonline.com/copyright">ARCGIS</a> contributors',
                keepBuffer: 3,
            }),
        'Shaded Relief': L.tileLayer(
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
            {
                maxZoom: 17,
                minZoom: 4,
                attribution: '&copy; <a href="https://www.arcgisonline.com/copyright">ARCGIS</a> contributors',
                keepBuffer: 3,
            })
    }

};


/**
 * Generate map marker SVG.
 *
 * @public
 * @param count
 * @param {Object} cluster
 * @return string
 */

export const getMarker = (count=0, cluster=false) => {

    const {isSelected=false, stations=[]} = cluster || {};

    // select marker fill colour based on selection and station status
    const fillColours = {
        missing: '#E34234',
        grouped: '#63BAAB',
        located: '#008DF2',
        repeated: '#8E36A8',
        partial: 'darkgoldenrod',
        mastered: '#00A652',
        selected: 'coral',
        default: '#008896'
    }

    // set fill colour based on station status
    const _getFillColour = (station) => {
        const { status='' } = station || {};
        return fillColours.hasOwnProperty(status) ? fillColours[status] : fillColours.default;
    }

    const fill = isSelected
        ? fillColours.selected
        : count === 1 && stations.length === 1
            ? _getFillColour(stations[0])
            : fillColours.default;

    // marker SVG templates
    const markers = {
        icon: `<svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 17.638889 21.166664"
        height="22"
        width="22">
        <circle fill="#FFFFFF" cx="9" cy="9" r="7"/>
        <g
            transform="translate(-78.115082,-80.886905)"
            id="layer1">
            <path
                fill="#000000"
                d="m 86.934522,80.886905 c -4.8701,0 -8.81944,3.876146 -8.81944,8.656287 0,4.855101 3.8585,8.173855 8.81944,12.510378 4.96094,-4.336523 8.81945,-7.655277 8.81945,-12.510378 0,-4.780141 -3.94935,-8.656287 -8.81945,-8.656287 z m 0,15.875 c -3.89731,0 -7.05555,-3.159125 -7.05555,-7.055555 0,-3.896431 3.15824,-7.055556 7.05555,-7.055556 3.89731,0 7.05556,3.159125 7.05556,7.055556 0,3.89643 -3.15825,7.055555 -7.05556,7.055555 z"
            />
        </g>
        <text
            x="50%"
            y="55%"
            fill="#000000"
            font-weight="bold"
            font-family="sans-serif"
            font-size="10px"
            text-anchor="middle">N</text>
    </svg>`,

        cluster: `<svg viewBox="0 0 19.757 23.289" height="80" width="80" xmlns="http://www.w3.org/2000/svg">
  <path d="M 9.879 1.214 C 5.008 1.214 1.059 5.09 1.059 9.87 C 1.059 14.725 4.918 18.044 9.879 22.381 C 14.839 18.044 18.698 14.725 18.698 9.87 C 18.698 5.09 14.749 1.214 9.879 1.214 Z" id="path28" stroke="white" stroke-width="4%" fill="${fill}" />
  <circle fill="#FFFFFF" cx="10.004" cy="10.095" r="7" />
                            <text
                                x="50%"
                                y="50%"
                                fill="#282c34"
                                font-weight="bold"
                                font-family="sans-serif"
                                font-size="6px"
                                text-anchor="middle">
                                ${count}
                            </text>
                        </svg>`,

        single: `<svg viewBox="0 0 146.398 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M 65.93 189.262 C 12.853 112.314 3 104.417 3 76.138 C 3 37.402 34.402 6 73.138 6 C 111.874 6 143.276 37.402 143.276 76.138 C 143.276 104.417 133.424 112.314 80.346 189.262 C 76.863 194.293 69.413 194.293 65.93 189.262 Z M 73.138 105.363 C 89.279 105.363 102.363 92.279 102.363 76.138 C 102.363 59.998 89.279 46.914 73.138 46.914 C 56.998 46.914 43.914 59.998 43.914 76.138 C 43.914 92.279 56.998 105.363 73.138 105.363 Z" 
   stroke="white" stroke-width="5%" fill="${fill}" />
</svg>`,
    };

    return count === 1 ? markers.single : markers.cluster;
};

/**
 * Parse XML data into DOM object.
 *
 * @public
 *
 * @param {String} xmlString
 * @return {Document}
 */

export const parseMapSheetKML = (xmlString) => {

    const parser = new DOMParser();
    const xsltProcessor = new XSLTProcessor();

    const xslString = `
    <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
      <xsl:output method="xml" indent="yes"/>
    
      <!-- Match the root element and copy it to the output -->
      <xsl:template match="/">
        <xsl:copy>
          <xsl:apply-templates/>
        </xsl:copy>
      </xsl:template>
    
      <!-- Match any element with a "Style" or "StyleMap" name and skip it -->
<!--      <xsl:template match="*[local-name()='Style' or local-name()='StyleMap' or local-name()='styleUrl' or local-name()='Point']"/>-->
    
      <!-- Match any other element and copy it to the output -->
      <xsl:template match="*">
        <xsl:copy>
          <xsl:apply-templates/>
        </xsl:copy>
      </xsl:template>

    </xsl:stylesheet>
    `

    // Parse XSLT string
    const xsltDoc = parser.parseFromString(xslString, "text/xml");
    xsltProcessor.importStylesheet(xsltDoc);

    // Parse XML string
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    return xsltProcessor.transformToDocument(xmlDoc);
};

/**
 * Generate feature popup HTML.
 *
 * @public
 * @return string
 * @param id
 * @param feature
 * @param layer
 * @param callback
 */

export const setFeaturePopup = (id, feature, layer, callback) => {
    // does this feature have a property named popupContent?
    const {properties} = feature || {}
    const {name, type, description, owner, owner_id, dependents} = properties || {};
    const popup = document.createElement('div');

    // map object link
    const mapObjectLink = document.createElement('div');
    mapObjectLink.innerHTML = `<span style="color: #888; font-weight: bold; cursor: pointer">${owner || ''}</span>`;
    mapObjectLink.addEventListener("click", () => {
        callback(owner_id || '', 'map_objects');
    });
    // featureLink.removeEventListener("click", () => {
    //     console.log(feature)
    // });
    // map feature link
    const mapFeatureLink = document.createElement('div');
    mapFeatureLink.innerHTML = `<span style="color: #008896; font-weight: bold; cursor: pointer; font-size: larger">${name}</span>`;
    mapFeatureLink.addEventListener("click", () => {
        callback(id, 'map_features');
    });
    mapFeatureLink.removeEventListener("click", () => {
        callback(id, 'map_features')
    });
    const featureDetails = document.createElement('div');
    featureDetails.innerHTML = `
        <div>${(type || '').toUpperCase()}</div>
        <div>${description || ''}</div>`;

    // Include linked survey seasons maps
    const surveySeasonsDetails = document.createElement('div');
    // add elements for each dependent
    (dependents || []).forEach(dependent => {
        const {surveyor, surveyor_id, survey, survey_id, survey_season, survey_season_id} = dependent || {};
        const surveySeasonLink = document.createElement('div');
        surveySeasonLink.setAttribute('style', 'border-top: 1px solid #444');
        surveySeasonLink.innerHTML = `<span style="color: #B65179; font-weight: bold; cursor: pointer">Survey Season ${survey_season}</span>`;
        surveySeasonLink.addEventListener("click", () => {
            callback(survey_season_id, 'survey_seasons');
        });
        const surveyLink = document.createElement('div');
        surveyLink.innerHTML = `<span style="color: #888; font-weight: bold; cursor: pointer">${survey}</span>`;
        surveyLink.addEventListener("click", () => {
            callback(survey_id, 'surveys');
        });
        const surveyorLink = document.createElement('div');
        surveyorLink.innerHTML = `<span style="color: #888; font-weight: bold; cursor: pointer">${surveyor}</span>`;
        surveyorLink.addEventListener("click", () => {
            callback(surveyor_id, 'surveyors');
        });
        surveySeasonsDetails.append(surveySeasonLink, surveyLink, surveyorLink);
    });

    // compose popup HTML
    popup.appendChild(mapFeatureLink);
    popup.appendChild(featureDetails);
    popup.appendChild(surveySeasonsDetails);
    // popup.appendChild(mapObjectLink);
    // add popup to map layer
    layer.bindPopup(popup, {
        closeOnClick: true,
        autoClose: true
    });
}