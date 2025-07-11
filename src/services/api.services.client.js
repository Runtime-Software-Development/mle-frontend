/*!
 * MLE.Client.Services.API
 * File: api.services.client.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Fetch wrapper used to abstract API service layer in components.
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 *
 * ---------
 * Revisions
 * - 10-15-2023   Updated download function to send 'null' error on load end.
 */

import { createAPIURL } from '../utils/paths.utils.client';
import { saveAs } from 'file-saver';

/**
 * Fetch options for JSON API request.
 * Options:
 * - method: *GET, POST only
 * - cors: no-cors, *cors, same-origin
 * - cache: *default, no-cache, reload, force-cache, only-if-cached
 * - credentials: include, *same-origin, omit
 * - headers: (see authHeader)
 * - redirect: manual, *follow, error
 * - referralPolicy:
 *      no-referrer, *no-referrer-when-downgrade, origin,
 *      origin-when-cross-origin, same-origin, strict-origin,
 *      strict-origin-when-cross-origin, unsafe-url
 *
 * @public
 * @params {data, files, method}
 */

const getFetchOptions = ({ data = null, files = null, download = null, method = 'POST' }) => {

    // set request options
    const opts = {
        method: method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    }

    // include form data in body for posts
    // body data type must match "Content-Type" header
    if (data) {
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = JSON.stringify(data);
    }

    // omit _static type from header for file(s) uploads
    if (files) {
        // opts.header = { 'Content-Type' : 'multipart/form-data' };
        opts.body = files;
    }

    // for file downloads, modify header to accept requested file format
    if (download) {
        opts.headers = {
            Accept: getMIME(download)
        };
    }

    return opts
}

/**
 * Make request to API.
 *
 * @public
 * @param {url, data, method, token}
 */

export async function makeRequest({
    url = '/',
    data = null,
    files = null,
    method = 'POST',
    download = null
}) {
    try {
        // compose request headers/options
        const opts = getFetchOptions({ data, files, method, download });

        // send request to API
        let res = await fetch(url, opts);
        if (!res) return null;

        // Modify response to include status ok, success, and status text
        return {
            success: res.ok,
            status: res.status,
            statusText: res.statusText,
            response: files
                ? null
                : download ? await res.blob() : await res.json()
        }
    } catch (err) {
        console.error('[ERROR] API fetch:', err);
        throw new Error('[ERROR] API fetch:', err);
    }
}


/**
 * Request method to upload file(s) via API.
 *
 * @public
 * @param {String} route
 * @param formData
 * @param callback
 * @param online
 */

export const upload = async (route, formData, callback = () => { }, online = true) => {

    // reject null paths or when API is offline
    if (!route || !online) return null;

    // DEBUG: Display the key/value pairs of form data
    // for(let pair of formData.entries()) {
    //     console.log(pair[0]+ ', '+ pair[1]);
    // }

    try {

        let xhr = new XMLHttpRequest();
        xhr.open('POST', createAPIURL(route), true);
        xhr.withCredentials = true;
        xhr.responseType = 'json';

        // request finished event
        xhr.onload = function (e) {
            if (xhr.readyState === 4) {
                const { statusText = 'An API Error Occurred.' } = e.currentTarget || {};
                const { response = {} } = e.currentTarget || {};
                const { message = {} } = response || {};
                const { msg = statusText } = message || {};

                // success
                if (xhr.status === 200) {
                    return callback(null, { msg: msg, type: 'success' }, response);
                }
                // error
                else {
                    return callback(null, { msg: msg, type: 'error' });
                }
            }
        };

        // error in sending network request
        xhr.onerror = function (e) {
            const { statusText = '' } = e.currentTarget || {};
            return callback(null, { msg: statusText || 'An API Error Occurred.', type: 'error' });
        };

        // abort network request
        xhr.onabort = function () {
            return callback(null, { msg: 'Upload has been stopped.', type: 'warn' });
        };

        // Upload progress callback
        xhr.upload.onprogress = function (e) {
            return callback(e);
        };

        // Upload error callback
        xhr.upload.onerror = function () {
            return callback(null, { msg: 'An unknown API error has occurred.', type: 'error' });
        };

        // Upload timeout callback
        xhr.upload.ontimeout = function () {
            return callback(null, { msg: 'Update has timed out.', type: 'error' });
        };

        // Upload abort callback
        xhr.upload.onabort = function () {
            return callback(null, { msg: 'Update was aborted.', type: 'warn' });
        };

        // Upload end callback
        xhr.upload.onloadend = function () {
            return callback(null, { msg: 'Update completed!', type: 'success' });
        };

        // send POST request to server and return request
        xhr.send(formData);
        return xhr;

    } catch (err) {
        return callback(null, { msg: 'Submission Failed. Please try again.', type: 'error' });
    }
};


/**
 * Request method to download file(s) via API.
 *
 * @public
 * @param {String} route
 * @param callback
 * @param filename
 * @param online
 * @param save
 * @return {Promise}
 */

export const download = async (route, callback = () => { }, filename, online = true, save = true) => {

    // reject null paths or when API is offline
    if (!route || !online) return null;

    try {

        let xhr = new XMLHttpRequest();
        xhr.open('GET', createAPIURL(route), true);
        xhr.withCredentials = true;
        xhr.responseType = 'blob';

        // request finished event
        xhr.onload = function (e) {
            if (xhr.readyState === 4) {
                const { statusText = 'An API Error Occurred.' } = e.currentTarget || {};
                const { response = {} } = e.currentTarget || {};
                const { message = {} } = response || {};
                const { msg = statusText } = message || {};

                // (optional) save file to local drive as streamed blob
                if (save) saveAs(response, filename);

                // success
                if (xhr.status === 200) {
                    return callback(null, { msg: msg, type: 'success' }, response);
                }
                // error
                else {
                    return callback(null, { msg: msg, type: 'error' });
                }
            }
        };

        // listen for `progress` event
        xhr.onprogress = function (e) {
            return callback(null, e);
        };

        // end of download
        xhr.onloadend = function (e) {
            return callback(null, e);
        };

        // error in sending network request
        xhr.onerror = function (e) {
            const { statusText = '' } = e.currentTarget || {};
            return callback({ msg: statusText || 'An API Error Occurred.', type: 'error' }, e);
        };

        // abort network request
        xhr.onabort = function (e) {
            return callback({ msg: 'Download has been stopped.', type: 'warn' }, e);
        };

        // send POST request to server and return request
        xhr.send();
        return xhr;

    } catch (err) {
        return callback(null, { msg: 'Submission Failed. Please try again.', type: 'error' });
    }
};

/**
 * Get KML metadata as parsed XML string.
 *
 * @src public
 * @param route
 * @return {Promise} KML string
 */

export const loadXML = async (route) => {

    // reject null paths
    if (!route) return null;

    // Load kml file
    return await fetch(route)
        .then(res => res.text())
        .then(xmlString => {

            // Parse XML string
            const parser = new DOMParser();
            return parser.parseFromString(xmlString, 'text/xml');
        })
        .catch(console.error);
}

/**
 * Lookup allowed mimetype from file extension.
 *
 * @src public
 * @param {String} format
 * @return {String} mimetype
 */

export function getMIME(format) {
    const mime_types = {
        "any": "*/*",
        "img": 'image/*',
        "csv": 'text/csv',
        "json": 'text/json',
        "xml": 'text/xml',
        'pdf': 'application/pdf',
        'bm': 'image/bmp',
        'bmp': 'image/bmp',
        'gif': 'image/gif',
        'jpe': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'tif': 'image/tiff',
        'tiff': 'image/tiff',
        'tiff-le': 'image/tiff',
        'tiff-be': 'image/tiff',
        '3RF': 'image/*',
        'CR2': 'image/x-canon-cr2',
        'CRW': 'image/x-canon-crw',
        'DCR': 'image/x-kodak-dcr',
        'DNG': 'image/x-adobe-dng',
        'ERF': 'image/x-epson-erf',
        'K25': 'image/x-kodak-k25',
        'KDC': 'image/x-kodak-kdc',
        'MRW': 'image/x-minolta-mrw',
        'NEF': 'image/x-nikon-nef',
        'ORF': 'image/x-olympus-orf',
        'PEF': 'image/x-pentax-pef',
        'RAF': 'image/x-fuji-raf',
        'RAW': 'image/x-panasonic-raw',
        'SR2': 'image/x-sony-sr2',
        'SRF': 'image/x-sony-srf',
        'X3F': 'image/x-sigma-x3f',
    };
    return mime_types.hasOwnProperty(format) ? mime_types[format] : null;
}