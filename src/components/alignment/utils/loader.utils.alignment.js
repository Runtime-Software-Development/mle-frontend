/*!
 * MLE.Client.Toolkit.Utilities.Loader
 * File: loader.utils.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Alignment Tool image loader utilities. Loads image data from local file, MLE API library download
 * or from a URL.
 *
 * ---------
 * Revisions
 * - 09-07-2023   Major upgrade to Toolkit incl. UI and workflow improvements and OpenCV integration
 */

import * as UTIF from 'utif';
import { download, getMIME } from '../../../services/api.services.client';
import { getError } from '../../../services/schema.services.client';

/**
 * Loads and converts image file data for use in IAT canvas layers.
 *
 * @param properties
 * @param callback
 * @private
 */

export const loadImage = async (properties, callback) => {

    /**
     * Load file data into canvas layers (indexed by MIME type).
     */

    const loadFile = (fileData, mimeType, url = null) => {

        /**
         * Image data processors indexed by file type
         */

        const fileHandlers = {
            'image/tiff': () => {
                loadTIFF(fileData)
                    .then(tiff => {
                        // convert data to Image Data object
                        const { width = 0, height = 0, data = [] } = tiff || {};
                        // update local panel properties
                        properties.mime_type = mimeType;
                        properties.source_dims = { w: width, h: height };
                        properties.image_dims = { w: width, h: height };
                        properties.render_dims = { x: 0, y: 0, w: width, h: height };
                        callback({status: 'load', data: toImageData(data, width, height), props:  properties});
                    })
                    .catch((err) => {callback({status: 'empty', error: err})});
            },
            'default': () => {
                // select (blob) file data or convert to string containing a URL representing
                // the object given in the parameter.
                const src = fileData ? URL.createObjectURL(fileData) : url;

                // load image source and set panel properties
                const img = new Image();
                img.onerror = (err) => {callback({status: 'empty', error: err})};
                img.onload = function() {
                    URL.revokeObjectURL(src); // free memory held by Object URL
                    // update local panel properties
                    properties.mime_type = mimeType;
                    properties.source_dims = { w: img.width, h: img.height };
                    properties.image_dims = { w: img.width, h: img.height };
                    properties.render_dims = { x: 0, y: 0, w: img.width, h: img.height };
                    callback({status: 'load', data: img, props: properties});
                }
                img.src = src;
            }
        };
        return fileHandlers.hasOwnProperty(mimeType)
            ? fileHandlers[mimeType]()
            : fileHandlers.default();
    };

    /**
     * Image data utils
     */

    const loaders = {

        /**
         * Handle image data downloaded from API
         *  - download image file from MLP library
         */

        api: (id, selectRaw) => {

            console.log(id, selectRaw)

            /**
             * Update progress data. Progress data is updated until
             * uploading has completed.
             *
             * @param error
             * @param e
             * @param response
             * @private
             */

            const _handleProgress = (error, e, response) => {
                // handle error
                if (error) callback(error);
                // update progress indicator only if event available
                if (e) {
                    // get loaded/total bytes data from XHR progress event
                    // - converted to MB
                    const { loaded = 0, total = 0 } = e || {};

                    const completedBytes = (loaded / 1000000).toFixed(2);
                    const totalBytes = (total / 1000000).toFixed(2);
                    const percent = (100 * (completedBytes / totalBytes)).toFixed(0);
                    const notProgressive = total === 0;
                    const done = (total > 0 && loaded > 0 && total === loaded);

                    // update progress state
                    // if (!notProgressive) setMessage({msg: `${percent}%`, type: 'info'});
                    // else setMessage({msg: `${completedBytes}MB`, type: 'info'});
                    console.log(e, {msg: `${percent}%`, type: 'info'});

                    // end loading
                    if (done) {
                        // setMessage(null);
                        callback(null);
                    }
                }
                // response data is returned once file stream has ended
                if (response) {
                    // create image reader to load file data into canvas
                    const reader = new FileReader();
                    // set reader to load file (blob) data on stream end
                    reader.addEventListener('loadend', () => {
                        // reader.result contains the contents of blob as a typed array
                        const imgType = getImageType(reader.result);
                        loadFile(response, getMIME(imgType));
                    });
                    // load blob into reader to determine image format
                    reader.readAsArrayBuffer(response);
                    // setMessage(null);
                    callback({ error: null, props: properties });
                }
            }

            // download metadata/files to canvas via API
            // - select either full-sized raw image or low-res version based on 'selectRaw' flag
            const route = selectRaw ? `/files/download/raw?file_id=${id}` : `/files/download/${id}`;
            download(route, _handleProgress, `file_${id}`, true, false).catch(callback);
        },

        /**
         * Handle image data downloaded from local directory
         *  - loads JPEG/PNG/TIFF formats for image data
         */

        file: () => {
            const mimeType = properties.file.type;
            loadFile(properties.file, mimeType);
        },

        /**
         * Handle image data loaded from URL
         * - loads image data from url
         */

        url: () => {
            const mimeType = getMIME(properties.filename);
            loadFile(null, mimeType, properties.url);
        }
    };

    // Filter load method by input file data
    const { files_id='', file=null, url='', raw_file=false } = properties || [];

    // Load file from API
    if (files_id) return loaders.api(files_id, raw_file);
    // Load from uploaded file
    if (file) return loaders.file();
    // Load file from URL
    if (url) return loaders.url();
    // invalid load request
    return callback({
        status: 'cancel',
        message: null
    });
}

/**
 * Loads TIFF format image file.
 *
 * @param file
 * @return {Promise<unknown>}
 */

export const loadTIFF = (file) => {

    if (!file) return null;

    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onerror = (err) => {
            console.error(err);
            reader.abort();
            reject({ msg: getError('streamError', 'canvas'), type: 'error' });
        };
        reader.onload = (e) => {
            let buffer = e.target.result;

            // validate TIFF data
            const imgType = getImageType(buffer);
            if (imgType !== 'tiff-le' && imgType !== 'tiff-be') {
                reject({
                    msg: `Problem parsing TIFF data stream: Image is of ${imgType.toUpperCase()} format.`,
                    type: 'error',
                });
                return;
            }

            // decode to Uint8Array of the image in RGBA format, 8 bits per channel
            const ifds = UTIF.decode(buffer);
            UTIF.decodeImage(buffer, ifds[0]);
            let rgba = UTIF.toRGBA8(ifds[0]);  // Uint8Array with RGBA pixels
            resolve({
                data: rgba,
                width: ifds[0].width,
                height: ifds[0].height,
            });
        };
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Converts data buffer array to image data.
 *
 * @param data
 * @param w
 * @param h
 */

export const toImageData = (data, w, h) => {
    return new ImageData(new Uint8ClampedArray(data), w, h);
};

/**
 * Determines image format based on file signature.
 * - NOTE: Not all of the following formats have been implemented.
 * Bitmap format .bmp 42 4d BM
 * FITS format .fits 53 49 4d 50 4c 45 SIMPL
 * GIF format .gif 47 49 46 38 GIF
 * Graphics Kernel System .gks 47 4b 53 4d GKS
 * IRIS rgb format .rgb 01 da
 * ITC (CMU WM) format .itc f1 00 40 bb
 * JPEG File Interchange Format .jpg ff d8 ff e0
 * NIFF (Navy TIFF) .nif 49 49 4e 31 IIN
 * PM format .pm 56 49 45 57 VIE
 * PNG format .png 89 50 4e 47 .PN
 * Postscript format .[e]ps 25 21 %
 * Sun Rasterfile .ras 59 a6 6a 95 Y.j
 * Targa format .tga xx xx xx ..
 * TIFF format (Motorola - big endian) .tif 4d 4d 00 2a MM.
 * TIFF format (Intel - little endian) .tif 49 49 2a 00 II*
 * X11 Bitmap format .xbm xx x
 * XCF Gimp file structure .xcf 67 69 6d 70 20 78 63 66 20 76 gimp xc
 * Xfig format .fig 23 46 49 47 #FI
 * XPM format .xpm 2f 2a 20 58 50 4d 20 2a 2f
 * @return {string} image format
 */

export const getImageType = (buffer) => {
    const int8Array = new Uint8Array(buffer);
    const [b0, b1, b2, b3] = int8Array.slice(0, 4);

    // console.log(b0, b1, b2, b3);
    const formats = {
        'png': [],
        'gif': [],
        'bmp': [],
        'jpg': [255, 216, 255, 219],
        'tiff-le': [77, 77, 0, 42],
        'tiff-be': [73, 73, 42, 0],
    };
    const detected = Object.keys(formats).find((type) => {
        return b0 === parseInt(formats[type][0])
            && b1 === parseInt(formats[type][1])
            && b2 === parseInt(formats[type][2])
            && b3 === parseInt(formats[type][3]);
    });
    return detected || 'unknown';
};