/*!
 * MLE.Client.Providers.Data
 * File: data.provider.client.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * API data context provider. Auto-loads and filters request data from API
 * to be consumed by components.
 *
 * ---------
 * Revisions
 * - 22-07-2023 Include core node data in context value.
 */

import * as React from 'react'
import { useRouter } from './router.provider.client';
import { getRootNode } from '../utils/data.utils.client';
import {addNode, setSessionMsg} from '../services/session.services.client';

/**
 * Global data provider.
 *
 * @public
 */

const DataContext = React.createContext({})

/**
 * Provider component to allow consuming components to subscribe to
 * API request handlers.
 *
 * @public
 * @param {Object} props
 */

function DataProvider(props) {

    const router = useRouter();

    // API data states
    const [loaded, setLoaded] = React.useState(false);
    const [apiData, setAPIData] = React.useState({});
    const [view, setView] = React.useState('');
    const [model, setModel] = React.useState('');
    const [attributes, setAttributes] = React.useState({});
    const [options, setOptions] = React.useState({});
    const [path, setPath] = React.useState([]);

    // data error
    const [error, setError] = React.useState(false);

    // Addresses: Can't perform a React state update on unmounted component.
    // This is a no-op, but it indicates a memory leak in your
    // application. To fix, cancel all subscriptions and
    // asynchronous tasks in a useEffect cleanup function.
    const _isMounted = React.useRef(false);

    // refresh API data
    const _refresh = () => {
        loadOptions();
        setLoaded(false);
    }

    // destructure API data object
    const destructure = (dataObj) => {
        const {
            label = '',
            metadata = {},
            node = {},
            file = {},
            files = {},
            dependents = [],
            owner = {},
            attached = {},
            status = '',
            refImage = {},
            hasDependents = false,
        } = dataObj || {};
        const type = node.type || file.file_type || '';
        const id = node.id || file.id || '';

        // get current owner
        const {owner_id = '', owner_type = ''} = node || {};
        const ownerData = owner_type && owner_id
            ? {id: owner_id, type: owner_type}
            : owner;

        // check if label is empty, if so, use root node label
        const labelAlt = label ? label : getRootNode(path).label;

        const {lat='', lng=''} = metadata || {};

        // get proximate geographical location of node from station (if available)
        const location = !lng || !lat
            ? Object.keys(path)
                .filter(index => path[index].hasOwnProperty('node') && path[index].node.type === 'stations')
                .reduce((o, index) => {
                    const {metadata={}} = path[index] || {};
                    const {lat='', lng=''} = metadata || {}
                    o.lat = lat;
                    o.lng = lng;
                    return o;
                }, {})
            : {lng: metadata.lng, lat: metadata.lat}

        return {
            id: id,
            type: type,
            label: labelAlt,
            metadata: metadata,
            location: location,
            node: node,
            file: file,
            files: files,
            refImage: refImage,
            dependents: dependents,
            attached: attached,
            owner: ownerData,
            status: status,
            hasDependents: hasDependents
        }
    }

    /**
     * API loader for node data.
     * - uses current route as default endpoint.
     *
     * @public
     */

    const loadData = React.useCallback(() => {
        router.get(router.route)
            .then(res => {
                if (!res) return null;
                const {response = {}} = res || {};

                // DEBUG
                console.log('\n<<< API Data Check >>>\n', res)

                // destructure API data for settings
                const {
                    data = null,
                    view = '',
                    model = {},
                    path = {},
                    message = {}
                } = response || {};
                const {name = '', attributes = {}} = model || {};

                // check if response data is empty (set error flag to true)
                if (res && res.error) {
                    setError(message);
                }

                // update states with response data
                setAttributes(attributes);
                setAPIData(data);
                setView(view);
                setModel(name);
                setPath(path);
                setSessionMsg(message);
                setLoaded(true);
            })
            .catch(err => console.error(err));

    }, [router]);

    /**
     * API loader for global options / settings data.
     *
     * @public
     */

    const loadOptions = React.useCallback((type='options') => {
        router.get(`/${type}`)
            .then(res => {
                if (!res) return null;

                // DEBUG
                // console.log('\n<<< Options >>>\n', res);

                if (res.error) return setError(res.error);
                // destructure API data for options
                const { response = {} } = res || {};
                const { data = {}, message = {} } = response || {};
                // update states with response data
                if (message.type === 'error') setSessionMsg(message);
                setOptions(data);
                // DEBUG
                if (process.env.DEBUG === 'true') {
                    console.log('<<< Loaded Global Options >>>', data);
                }
            })
            .catch(err => console.error(err));
    }, [router, setOptions, setError]);

    /**
     * Load API options and node data in provider.
     *
     * @public
     */

    // non-static views: fetch API global options
    React.useEffect(() => {
        _isMounted.current = true;

        // call API for metadata options (if user is logged in)
        if (Object.keys(options).length === 0) {
            if (_isMounted.current) {
                loadOptions();
            }
        }
        return () => {
            _isMounted.current = false;
        }
    }, [options, loadOptions])

    // non-static views: fetch API data and set view data in state
    React.useEffect(() => {
        _isMounted.current = true;
        setError(null);

        // if static page, set API data to true
        if (router.staticView && router.online) {
            setLoaded(true);
        }

        // request data if not static view
        if (!router.staticView && router.online) {
            // set view to loading
            setAPIData({});
            setView('');
            setModel('');
            loadData();
        }
        return () => {
            _isMounted.current = false;
        };
    }, [router, loaded, loadData]);

    // destructure API data
    const root = getRootNode(path);
    const {
        id,
        type,
        node,
        label,
        metadata,
        location,
        dependents,
        owner,
        file,
        files,
        attached,
        status
    } = destructure(apiData);

    // provide current path node IDs
    const currentNodes = Object.keys((path || {}))
        .map(key => {
            const {node={}} = path[key] || {};
            const {id=''} = node || {};
            // add to local storage
            addNode(id);
            return id;
        });


    return (
        <DataContext.Provider value={
            {
                refresh: _refresh,
                loaded,
                view,
                model,
                path,
                nodes: currentNodes,
                root,
                file,
                files,
                data: apiData,
                error,
                label,
                type,
                id,
                node,
                owner,
                status,
                metadata,
                attached,
                location,
                attributes,
                dependents,
                options,
                setOptions,
                loadOptions,
                destructure
            }
        } {...props} />
    )

}

const useData = () => React.useContext(DataContext);
export { useData, DataProvider };
