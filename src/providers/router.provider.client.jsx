/*!
 * MLE.Client.Providers.Data
 * File: data.provider.client.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

import * as React from 'react'
import { makeRequest } from '../services/api.services.client';
import { createNodeRoute, filterPath, reroute, getRoot, createAPIURL } from '../utils/paths.utils.client';
import { getStaticView } from '../services/schema.services.client';
import { popSessionMsg } from '../services/session.services.client';

/**
 * Global data provider.
 *
 * @public
 */

const RouterContext = React.createContext({})

/** Number of retries before marking API offline */
const API_RETRY_COUNT = 3;
/** Delay in ms between retries */
const API_RETRY_DELAY_MS = 1500;
/** Lightweight route used to probe API availability (must return JSON) */
const PROBE_ROUTE = '/nodes/tree';

/**
 * Run a promise-returning function with retries.
 * @param {Function} fn - function that returns a Promise
 * @param {number} retries - number of attempts
 * @param {number} delayMs - delay between attempts
 * @returns {Promise}
 */
async function withRetry(fn, retries = API_RETRY_COUNT, delayMs = API_RETRY_DELAY_MS) {
    let lastErr;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            if (attempt < retries) {
                await new Promise(r => setTimeout(r, delayMs));
            }
        }
    }
    throw lastErr;
}

/**
 * Provider component to allow consuming components to subscribe to
 * API request handlers.
 *
 * @public
 * @param {Object} props
 */

function RouterProvider(props) {

    // API status state
    const [online, setOnline] = React.useState(true);

    // current client route in state
    const [currentRoute, setCurrentRoute] = React.useState(filterPath());

    // node filter in state
    const [filter, setFilter] = React.useState({});

    // query filter in state
    const [query, setQuery] = React.useState({});

    // static view state: static views do not require API requests
    const [staticView, setStaticView] = React.useState(getStaticView(filterPath()));

    // Update router states on re-render
    React.useEffect(() => {
        const routeUpdater = function () {

            // get the current URI path
            const uri = window.location.pathname;

            // set app route state
            setCurrentRoute(uri);
            setStaticView(getStaticView(filterPath()));

            // update route in browser
            reroute(uri);
        }
        // add history event listener
        window.addEventListener('popstate', routeUpdater);
        return () => {
            window.removeEventListener('popstate', routeUpdater);
        };
    });


    /**
     * Handle response data.
     *
     * @public
     * @param {Object} res
     */

    const handleResponse = (res) => {

        // No response: API is unavailable
        //if (!res) return setOnline(false);

        // return response (and error)
        const { response = {}, success = false } = res || {};
        const { message = {} } = response || {};
        return { error: !success ? message : null, response: response };
    }


    /**
     * Update the app route state.
     *
     * @public
     * @param {String} uri
     * @return {Promise}
     */
    const update = async function (uri) {

        // set app route state
        setCurrentRoute(uri);

        // set static view (if applicable)
        setStaticView(getStaticView(uri));
        setQuery({});

        // clear session messages
        popSessionMsg();

        // update route in browser
        reroute(uri);
    }

    /**
     * Probe API availability (ignores online flag). On success, sets online to true.
     * Used for auto-recovery and the Retry button on the unavailable page.
     * @returns {Promise<boolean>} true if API is back, false otherwise
     */
    const tryReconnect = async () => {
        try {
            const res = await makeRequest({
                url: createAPIURL(PROBE_ROUTE),
                method: 'GET'
            });
            if (res && res.success) {
                setOnline(true);
                return true;
            }
            return false;
        } catch (err) {
            return false;
        }
    };

    /**
     * Data request method to fetch data from API.
     *
     * @public
     * @param {String} route
     * @param {Object} params
     * @return {Promise} response data
     */

    const get = async (route, params = null) => {

        // reject null paths or when API is offline
        if (!route || !online) return null;

        let res = await withRetry(() =>
            makeRequest({ url: createAPIURL(route, params), method: 'GET' })
        ).catch(err => {
            console.error('An API error occurred:', err);
            setOnline(false);
            return null;
        });

        return handleResponse(res);
    };


    /**
     * Request method to post data from API.
     *
     * @public
     *
     * @param {String} route
     * @param {Object} formData
     * @param {Boolean} json
     */

    const post = async (route, formData = null, json = false) => {

        // reject null paths or when API is offline
        if (!route || !online) return null;

        // parse form data
        const parsedData = formData && !json ? Object.fromEntries(formData) : formData && json ? formData : {};

        let res = await withRetry(() =>
            makeRequest({
                url: createAPIURL(route),
                method: 'POST',
                data: parsedData
            })
        ).catch(err => {
            console.error('An API error occurred:', err);
            setOnline(false);
            return null;
        });

        return handleResponse(res);
    };

    /**
     * Data request method to delete data from API.
     *
     * @public
     * @param {String} route
     * @param {Object} params
     * @return {Promise} response data
     */

    const deletion = async (route, params = null) => {

        // reject null paths or when API is offline
        if (!route || !online) return null;

        let res = await withRetry(() =>
            makeRequest({ url: createAPIURL(route, params), method: 'DELETE' })
        ).catch(err => {
            console.error('An API error occurred:', err);
            setOnline(false);
            return null;
        });

        return handleResponse(res);
    };

    /**
     * Request method to delete node.
     *
     * @public
     * @param {String} id
     * @param {String} model
     * @param {Function} callback
     */

    const remove = async (id, model, callback) => {
        try {
            const route = createAPIURL(`/${model}/remove/${id}`);
            console.log('remove route:', route);

            // reject null paths or when API is offline, error found
            if (!route || !online) return null;
            let res = await makeRequest({ url: route, method: 'DELETE' })
                .then(callback)
                .catch(err => {
                    // handle API connection errors
                    console.error('An API error occurred:', err)
                    throw err;
                });
            return handleResponse(res);
        } catch (err) {
            console.error('Error removing node:', err);
            throw err;
        }
    }

    /**
     * Provider instance.
     */

    return (
        <RouterContext.Provider value={
            {
                update,
                base: getRoot(),
                route: currentRoute,
                query,
                filter,
                setFilter,
                staticView,
                get,
                post,
                remove,
                deletion,
                online,
                setOnline,
                tryReconnect
            }
        } {...props} />
    )

}

const useRouter = () => React.useContext(RouterContext);
export { useRouter, RouterProvider };
