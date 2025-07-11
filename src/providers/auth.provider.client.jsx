/*!
 * MLE.Client.Providers.Authenticate
 * File: auth.providers.client.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import * as React from 'react'
import { useRouter } from './router.provider.client';

/**
 * Global authentication context.
 *
 * @public
 */

const AuthContext = React.createContext({})

/**
 * Provider component to allow consuming components to subscribe to
 * authentication context changes.
 *
 * @public
 * @param {Object} props
 */

function AuthProvider(props) {

    const _isMounted = React.useRef(false);
    let [data, setData] = React.useState(null);
    let [processing, setProcessing] = React.useState(false);

    const router = useRouter();

    /**
     * User login request.
     *
     * @public
     *
     */

    const login = async (credentials) => {
        setProcessing(true);
        return await router.post('/login', credentials)
            .then(res => {
                const { response={} } = res || {};
                const { user=null, message={} } = response || {};
                setProcessing(false);
                // create user session (if user data provided)
                if (user) {
                    setData(user);
                    return null;
                }
                return message;
            });
    }

    /**
     * User logout request
     *
     * @public
     */

    const logout = async () => {
        setProcessing(true);
        await router.post('/logout')
            .then(() => {
                // Note: Keycloak logout operation returns no_static (204)
                setData(null);
            });
        setProcessing(false);
    }

    /**
     * User login request.
     *
     * @public
     *
     */

    const authorize = async () => {
        // request new token
        router.post('/refresh', null, true)
            .then(res => {
                const { response={} } = res || {};
                const { user = null } = response || {};

                // include role nesting
                if (user && user.hasOwnProperty('role')) {
                    const {role = ['']} = user || {};
                    user.isEditor = role[0] === 'editor' || role[0] === 'administrator' || role[0] === 'super_administrator';
                    user.isAdmin = role[0] === 'administrator' || role[0] === 'super_administrator';
                }
                return user;
            });
    }

    /**
     * Post-Render: Refresh access token with API.
     *
     * @public
     */

    React.useEffect(() => {
        _isMounted.current = true;

        // request new token
        router.post('/refresh', null, true)
            .then(res => {
                const { response={} } = res || {};
                const { user = null } = response || {};

                // include role nesting
                if (user && user.hasOwnProperty('role')) {
                    const {role = ['']} = user || {};
                    user.isEditor = role[0] === 'editor' || role[0] === 'administrator' || role[0] === 'super_administrator';
                    user.isAdmin = role[0] === 'administrator' || role[0] === 'super_administrator';
                }

                // set user data
                if (_isMounted.current) {
                    setData(user);
                }
            });
        return () => {
            _isMounted.current = false;
        };

    }, [router]);

    /*
    Value is not optimized with React.useMemo here because this
    is the top-most component rendered in our app and it will very
    rarely re-render/cause a performance problem.
    */

    return (
        <AuthContext.Provider value={{
            data,
            processing,
            login,
            logout,
            authorize
        }} {...props} />
    )

}

const useAuth = () => React.useContext(AuthContext);
export {useAuth, AuthProvider};
