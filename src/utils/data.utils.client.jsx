/*!
 * MLE.Client.Utilities.Data
 * File: data.utils.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

/**
 * Capitalize first letter of string.
 *
 * @param {String} str
 * @return {String} capitalized string
 * @public
 */

export const capitalize = (str) => {
    if (typeof str !== 'string') return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Make camelCase strings snake_case.
 *
 * @param {String} str
 * @return {String} snake_case string
 * @src public
 */

export const toSnake = (str) => {
    return str.replace(/[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Make snake/camel case strings readable.
 *
 * @param {String} str
 * @return {String} readable string
 * @src public
 */

export function humanize(str) {
    if (!str || str === '') return '';
    str = toSnake(str);
    let i, frags = str.split('_');
    for (i = 0; i < frags.length; i++) {
        frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    return frags.join(' ');
}

/**
 * Converts coordinate from decimal degrees to DMS format
 *
 * @return {String} capitalized string
 * @public
 * @param coord
 */

export function convertCoordDMS(coord) {
    const absolute = Math.abs(coord);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    return (degrees + '\u00B0' + minutes + '\u2032' + seconds + '\u2033');
}

/**
 * Converts lat/lng coordinate from DMS format to decimal degrees
 *
 * @return {number} decimal latitude / longitude
 * @public
 * @param degrees
 * @param minutes
 * @param seconds
 */

export function convertCoordDeg(degrees, minutes, seconds) {
    return (parseFloat(degrees) + parseFloat(minutes) / 60 + parseFloat(seconds) / 3600)
}

/**
 * Convert a `Map` to a standard
 * JS object recursively.
 *
 * @param {Map} map to convert.
 * @returns {Object} converted object.
 */

export const mapToObj = (map) => {
    const out = Object.create(null);
    map.forEach((value, key) => {
        if (value instanceof Map) {
            out[key] = mapToObj(value)
        }
        else {
            out[key] = value
        }
    })
    return out
}

/**
 *
 * Extract a hierarchy array from a stringified formData single input.
 *
 *
 * i.e. topLevel[sub] => [topLevel, sub]
 *
 * @return {Array}
 *
 * @param string
 */

export const extractFieldIndex = (string) => {
    const arr = string.split('[');
    const first = arr.shift();
    const res = arr.map( v => v.split(']')[0] );
    res.unshift(first);
    return res;
};

/**
 * Group array rows by common key
 * Reference: https://stackoverflow.com/a/38575908
 *
 * @param {Array} arr
 * @param {String} key
 * @src public
 */

export function groupBy(arr, key) {
    if (arr == null) return null;
    return arr.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
}

/**
 * Natural sort items by alphanumerical values in label strings.
 *
 * @param {Object} a
 * @param {Object} b
 * @src public
 */

export function sorter(a, b) {
    try {
        return a.label
            .localeCompare(
                b.label, undefined, { numeric: true, sensitivity: 'base' }
            );
    } catch (err) {
        console.error(err);
    }
}


/**
 * Compares two values.
 *
 * @public
 * @param {Object} a
 * @param {Object} b
 * @return {Number} comparison result
 */
export function compare(a, b) {

    // undefined values are equal
    if (typeof a === 'undefined' || typeof b === 'undefined') return 0;

    // null values are equal
    if (a === null || b === null) return 0;

    // values of different types are equal
    if (typeof a !==  typeof b) return 0;

    // compare dates
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();

    // compare strings, booleans and numbers
    switch (typeof a) {
        case 'string':
            // compare strings case-insensitive
            return a.toLowerCase() - b.toLowerCase();
        case 'boolean':
            // compare booleans
            return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
        case 'number':
            // compare numbers
            return a - b;
        default:
            // other types are equal
            return 0;
    }
}


/**
 * Sanitizes a value with a render type.
 *
 * @public
 * @return sanitized value
 * @param value
 * @param render [date, datetime, timestamp, string, int, boolean, coord, reference, float, json]
 * @param href
 * @param label
 * @param prefix
 * @param suffix
 */

export const sanitize = (
    value,
    render='',
    href='',
    label='',
    prefix='',
    suffix=''
) => {

    // select data component for value
    const _dataElements = {
        /**
         * Date renderer.
         *
         * @param value
         * @return sanitized date value
         */
        date: ({ value }) => {
            const date = new Date(value);
            const month = date.toLocaleString('default', { month: 'long' });
            return value ? `${month} ${date.getDate()}, ${date.getFullYear()}` : '-';
        },
        /**
         * DateTime renderer.
         *
         * @param value
         * @return sanitized datetime value
         */
        datetime: ({ value }) => {
            const date = new Date(value);
            return value ? date.toLocaleString('default', {timeZone: 'America/Vancouver', timeZoneName: 'short'}) : '-';
        },
        /**
         * Timestamp renderer.
         *
         * @param value
         * @return sanitized timestamp value
         */
        timestamp: ({ value }) => {
            const date = new Date(value);
            return `${date.toLocaleString('default', {timeZone: 'America/Vancouver', timeZoneName: 'short'})}`;
        },
        /**
         * Text renderer.
         *
         * @param value
         * @return sanitized text value
         */
        text: ({ value }) => {
            return value ? String(value) : '-';
        },
        /**
         * Integer renderer.
         *
         * @param value
         * @return sanitized integer value
         */
        integer: ({ value }) => {
            return value
                ? <span className={'float'}>
                    {prefix} { parseInt(value) } {suffix}
                  </span>
                : '-';
        },
        /**
         * Float renderer.
         *
         * @param value
         * @return sanitized float value
         */
        float: ({ value }) => {
            return value
                ? <span className={'float'}>
                    {prefix} { parseFloat(value).toFixed(2) } {suffix}
                  </span>
                : '-';
        },
        /**
         * Coordinate renderer.
         *
         * @param value
         * @return sanitized coordinate value
         */
        coord: ({ value }) => {
            return value
                ? <span className={'coord'}>
                    {convertCoordDMS(value)}
                    &#160;&#160;<span>({ parseFloat(value).toFixed(3) })</span>
                  </span>
                : '-';
        },
        /**
         * Latitude renderer.
         *
         * @param value
         * @return sanitized latitude value
         */
        lat: ({ value }) => {
            return value
                ? <span className={'coord'}>
                    { parseFloat(value).toFixed(3) }
                    &#160;&#160;<span>({convertCoordDMS(value)})</span>
                  </span>
                : '-';
        },
        /**
         * Longitude renderer.
         *
         * @param value
         * @return sanitized longitude value
         */
        lng: ({ value }) => {
            return value
                ? <span className={'coord'}>
                    { parseFloat(value).toFixed(2) }
                    &#160;/&#160;<span>{convertCoordDMS(value)}</span>
                  </span>
                : '-';
        },
        /**
         * Filesize renderer.
         *
         * @param value
         * @return sanitized filesize value
         */
        filesize: ({ value }) => {
            return value != null ? (parseFloat(value)/1000000).toFixed(2) + ' MB' : '-';
        },
        /**
         * Image size renderer.
         *
         * @param value
         * @return sanitized image size value
         */
        imgsize: ({ value }) => {
            return value != null ? parseInt(value) + ' px' : '-';
        },
        /**
         * Reference renderer.
         *
         * @param value
         * @param href
         * @return sanitized reference value
         */
        reference: ({ value, href }) => {
            return value != null && href != null ? 'Node Reference' : '-';
        },
        /**
         * JSON renderer.
         *
         * @param value
         * @return sanitized json value
         */
        json: ({ value }) => {
            return value != null ? <pre style={{whiteSpace: 'pre-wrap'}} aria-label="JSON Object">
                {JSON.stringify(value, null, 2)}
                </pre> : '';
        },
        /**
         * Default renderer.
         *
         * @param value
         * @return sanitized default value
         */
        default: ({ value }) => {
            return value != null ? String(value) : '-';
        }
    }

    // render data component
    return render && _dataElements.hasOwnProperty(render)
        ? _dataElements[render]({ value, href, label })
        : _dataElements.default({ value });
}

/**
 * Get root node from node path. Indexed by '0'.
 *
 * @public
 * @return {Object} node
 * @param {Object} path
 */

export const getRootNode = (path=null) => {
    return Object.keys(path || {})
        .filter(key => key === '0')
        .reduce((o, key) => {
            return path[key];
        }, {});
}

/**
 * Generate unique ID value.
 *
 * @public
 */

export const genID = () => {
    return Math.random().toString(16).substring(2);
}

