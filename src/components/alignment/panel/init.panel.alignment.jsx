/*!
 * MLE.Client.Toolkit.Initialization
 * File: init.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */


/**
 * Canvas API image editor component.
 *
 * @public
 */

/**
 * Default settings.
 */

// default canvas dimensions
const DEFAULT_DIMS_W = 700;
const DEFAULT_DIMS_H = 600;

// OpenCV settings
const scriptId = 'opencv-react'
const moduleConfig = {
    wasmBinaryFile: 'opencv_js.wasm',
    usingWasm: true
}
const openCvVersion = '4.10.0';
const openCvPath = `https://docs.opencv.org/${openCvVersion}/opencv.js`;

/**
 * Initialize IAT panel properties.
 * @param panelID
 * @param panelLabel
 * @param inputData
 * @param user
 * @return {Object} default properties
 */

export const initPanel = (panelID, panelLabel = '', inputData = null, user=null) => {
    // Destructure input data
    const {
        file = {},
        fileData = null,
        metadata = {},
        filename = '',
        url = ''
    } = inputData || {};
    const {id = '', file_type = '', file_size = 0, owner_id = '', owner_type = ''} = file || {};
    const {image_state = '', mime_type = ''} = metadata || {};
    const {medium = ''} = url || {};

    // get user status
    const {isEditor, isAdmin} = user || {};
    const selectRawFile = !!isEditor || !!isAdmin;

    return {
        id: panelID,
        label: panelLabel,
        hidden: false,
        bounds: {},
        source_dims: {w: 0, h: 0},
        image_dims: {w: 0, h: 0},
        base_dims: {w: DEFAULT_DIMS_W, h: DEFAULT_DIMS_H},
        render_dims: {x: 0, y: 0, w: 0, h: 0},
        magnified_dims: {w: 1500, h: 1500},
        files_id: id,
        raw_file: selectRawFile,
        owner_id: owner_id,
        owner_type: owner_type,
        filename: filename,
        mime_type: mime_type,
        file_type: file_type,
        file_size: file_size,
        image_state: image_state,
        file: fileData,
        url: medium,
        lowResDataURL: null,
        dataURL: null,
        blob: null,
        pts: [],
        overlay: false,
        opencv: {
            version: openCvVersion,
        }
    };
};

/**
 * Initialize Toolkit default canvas options.
 * @return {Object} default properties
 */

export const initOptions = () => {
    return {
        controlPtMax: 4,
        magnifyZoom: 3,
        ptrRadius: 20,
        swap: false,
        maxCanvasWidth: 800,
        maxCanvasHeight: 800,
        minCanvasWidth: 400,
        minCanvasHeight: 400,
        maxImageWidth: 20000,
        maxImageHeight: 20000,
        minImageWidth: 100,
        minImageHeight: 100,
        maxMagnifiedWidth: 1500,
        maxMagnifiedHeight: 1500,
        formats: [
            { label: 'PNG', value: 'image/png'},
            { label: 'JPEG', value: 'image/jpeg'},
            { label: 'TIFF', value: 'image/tiff'}
        ],
        blobQuality: 0.95,
        defaultW: DEFAULT_DIMS_W,
        defaultH: DEFAULT_DIMS_H,
        status: ['empty', 'load', 'render', 'draw', 'clear', 'data', 'reset', 'loading', 'loaded', 'save', 'error']
    }

}

/**
 * Initialize IAT default OpenCV options.
 * @return {Object} default properties
 */

export const initOpenCV = (_isMounted) => {
    _isMounted.current = true;

    if ( document.getElementById(scriptId) || window.cv ) {
        return () => {
            _isMounted.current = false;
        };
    }

    // https://docs.opencv.org/3.4/dc/de6/tutorial_js_nodejs.html
    // https://medium.com/code-divoire/integrating-opencv-js-with-an-angular-application-20ae11c7e217
    // https://stackoverflow.com/questions/56671436/cv-mat-is-not-a-constructor-opencv
    // https://github.com/giacomocerquone/opencv-react
    moduleConfig.onRuntimeInitialized = () => {
        console.log('OpenCV Loaded:', !!window.cv)
    }
    window.Module = moduleConfig;

    const generateOpenCvScriptTag = () => {
        const js = document.createElement('script');
        js.id = scriptId;
        js.src = openCvPath;
        js.nonce = true;
        js.defer = true;
        js.async = true;
        return js
    }
    document.body.appendChild(generateOpenCvScriptTag());

    return () => {
        _isMounted.current = false;
    };

}

/**
 * Translate an OpenCV error code to a human-readable error string.
 * @param {Number|String|Error} err - The error code, string, or Error object to translate.
 * @returns {String} A human-readable error string.
 */
export const translateCVError = (err) => {
    
    const cv = window.cv;

    // Code modified from OpenCV TryIt playground
    // https://docs.opencv.org/3.4/d0/d84/tutorial_js_usage.html

    let errorStatement = undefined;

    if (typeof err === 'undefined') {
        // No error provided
        errorStatement = '';
    } else if (typeof err === 'number') {
        // Error code is a number
        if (!isNaN(err)) {
            // Convert the error code to an error string
            if (typeof cv !== 'undefined') {
                errorStatement = 'Exception: ' + cv.exceptionFromPtr(err).msg;
            }
        }
    } else if (typeof err === 'string') {
        // Error code is a string
        let ptr = Number(err.split(' ')[0]);
        if (!isNaN(ptr)) {
            // Convert the error code to an error string
            if (typeof cv !== 'undefined') {
                errorStatement = 'Exception: ' + cv.exceptionFromPtr(ptr).msg;
            }
        }
    } else if (err instanceof Error) {
        // Error is an instance of an Error object
        errorStatement = err;
    }

    return errorStatement;
}



