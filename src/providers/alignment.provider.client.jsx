/*!
 * MLE.Client.Provider.Toolkit
 * File: alignment.provider.client.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Toolkit provider is a React Context used to store and share image and metadata for
 * use by Image Toolkit panels. The Toolkit is used in the viewing, editing and transforming
 * image data that can be uploaded/downloaded to/from the MLP Library.
 *
 * -------------
 * Toolkit Modes
 * - Pan (Default): Pan image by dragging across canvas
 * - Crop: Crop image by selecting a bounding box and cropping area
 * - Control Point Selection: Select registration control points by clicking coordinates on canvas
 *
 * ---------
 * Revisions
 * - 09-07-2023   Major upgrade to Toolkit incl. UI and workflow improvements and OpenCV integration
 */

import * as React from 'react'
import {createNodeRoute, getQuery} from "../utils/paths.utils.client";
import {useRouter} from "./router.provider.client";
import {usePointer} from "../components/alignment/tools/pointer.alignment";
import {initOptions, initPanel, initOpenCV} from "../components/alignment/panel/init.panel.alignment";
import {useUser} from "./user.provider.client";

/**
 * Image Analysis Toolkit: Provider
 */

const IatContext = React.createContext({});
export const IatProvider = (props) => {

    const router = useRouter();
    const user = useUser();
    const _isMounted = React.useRef(false);

    // IAT operation mode
    const [mode, setMode] = React.useState('pan');

    // initialize inputs (optional)
    let input1 = null, input2 = null;

    // canvas identifiers
    const panel1ID = 'panel1';
    const panel2ID = 'panel2';
    const panel1Label = 'Left Panel';
    const panel2Label = 'Right Panel';

    // get query parameters for input files
    // - must correspond to an image file ID
    // - must correspond to an image file type
    const [inputParams, setInputParams] = React.useState({
        file1: getQuery('file1'), type1: getQuery('type1'),
        file2: getQuery('file2'), type2: getQuery('type2'),
    });

    // initialize error/info messages
    const [message, setMessage] = React.useState(null);

    // initialize menu dialog toggle
    const [dialog, setDialog] = React.useState(null);

    // global panel options
    const [options, setOptions] = React.useState(initOptions());

    // panel properties
    const [panel1Metadata, setPanel1Metadata] = React.useState(initPanel(panel1ID, panel1Label, input1, user));
    const [panel2Metadata, setPanel2Metadata] = React.useState(initPanel(panel2ID, panel2Label, input2, user));

    // renderable image data state
    const [img1Data, setImg1Data] = React.useState(null);
    const [img2Data, setImg2Data] = React.useState(null);

    // rendered image data state
    const [rendered1Data, setRendered1Data] = React.useState(null);
    const [rendered2Data, setRendered2Data] = React.useState(null);

    // internal image data source
    // - used to reset canvas data
    const [source1, setSource1] = React.useState(null);
    const [source2, setSource2] = React.useState(null);

    // initialize methods state for control canvas
    const [methods1, setMethods1] = React.useState(null);
    const [methods2, setMethods2] = React.useState(null);

    // loading status state
    const [signal1, setSignal1] = React.useState('empty');
    const [signal2, setSignal2] = React.useState('empty');

    // initialize canvas pointers
    const pointer1 = usePointer(panel1Metadata, options);
    const pointer2 = usePointer(panel2Metadata, options);

    /**
     * Load initial input image data (if in query parameters)
     */

    React.useEffect(() => {

        _isMounted.current = true;

        // load panel with API-downloaded image data
        const _loader = (
            inputTypeID,
            inputFileID,
            panelID,
            panelLabel,
            setPanelData,
            setImgData,
            setSignal
        ) => {

            setSignal('loading');

            // fallback for API endpoint response errors
            const _handleError = (error) => {
                console.error(error);
                setMessage({msg: 'Error: Image could not be loaded.'});
                setSignal('error');
            }

            // download image file data to panel canvas
            const route = createNodeRoute(inputTypeID, 'show', inputFileID);
            router.get(route)
                .then(res => {
                    if (_isMounted.current) {
                        if (!res || res.error) _handleError(
                            res && res.hasOwnProperty('error') ? res.error : 'API Error'
                        );
                        const { response = {} } = res || {};
                        const { data = {} } = response || {};

                        // store node path to file in navigator
                        // Object.keys(path)
                        //     .filter(key => path[key].hasOwnProperty('node'))
                        //     .forEach(key => addNode(path[key].node.id));

                        // load metadata to panel data state
                        setPanelData(initPanel(panelID, panelLabel, data, user));
                        setSignal('load');
                    }
                })
                .catch(console.error)
                .finally(() => {
                });
        }

        // Initialize IAT from input parameters
        // - load navigator image selection
        // - load query parameters: input image (only if not currently loaded)
        if (_isMounted.current) {

            const { file1=null, type1=null, file2=null, type2=null } = inputParams || {};

            // Initialize IAT from input parameters
            // - load input image (only if not currently loaded)
            if (file1 && type1) {
                _loader(type1, file1, panel1ID, panel1Label, setPanel1Metadata, setImg1Data, setSignal1);
                setInputParams(null);
            }
            if (file2 && type2) {
                _loader(type2, file2, panel2ID, panel2Label, setPanel2Metadata, setImg2Data, setSignal2);
                setInputParams(null);
            }
        }

        return () => {
            _isMounted.current = false;
        };
    }, [inputParams]);

    /**
     * Load OpenCV libraries to provider
     * **/

    React.useEffect(initOpenCV(_isMounted), []);

    return (
        <IatContext.Provider value={
            {
                mode: mode,
                setMode: setMode,
                cv: window.cv,
                setInputParams: setInputParams,
                panel1: {
                    properties: panel1Metadata,
                    setProperties: setPanel1Metadata,
                    update: (props) => {
                        setPanel1Metadata(data => (
                            Object.keys(props).reduce((o, key) => {
                                o[key] = props[key];
                                return o;
                            }, data)),
                        );
                    },
                    reset: () => {
                        setPanel1Metadata(initPanel(panel1ID, panel1Label, null, user));
                        setSource1(null);
                        setImg1Data(null);
                        setRendered1Data(null);
                        setSignal1('empty');
                    },
                    source: source1,
                    setSource: setSource1,
                    image: img1Data,
                    setImage: setImg1Data,
                    rendered: rendered1Data,
                    setRendered: setRendered1Data,
                    status: signal1,
                    setStatus: setSignal1,
                    pointer: pointer1,
                    methods: methods1,
                    setMethods: setMethods1,
                },
                panel2: {
                    properties: panel2Metadata,
                    setProperties: setPanel2Metadata,
                    update: (props) => {
                        setPanel2Metadata(data => (
                            Object.keys(props).reduce((o, key) => {
                                o[key] = props[key];
                                return o;
                            }, data)),
                        );
                    },
                    reset: () => {
                        setPanel2Metadata(initPanel(panel2ID, panel2Label, null, user));
                        setSource2(null);
                        setImg2Data(null);
                        setRendered2Data(null);
                        setSignal2('empty');
                    },
                    source: source2,
                    setSource: setSource2,
                    image: img2Data,
                    setImage: setImg2Data,
                    rendered: rendered2Data,
                    setRendered: setRendered2Data,
                    status: signal2,
                    setStatus: setSignal2,
                    pointer: pointer2,
                    methods: methods2,
                    setMethods: setMethods2,
                },
                dialog: dialog,
                setDialog: setDialog,
                options: options,
                setOptions: setOptions,
                message: message,
                setMessage:setMessage
            }
        } {...props} />
    )
};

export const useIat = () => React.useContext(IatContext)