/*!
 * MLE.Client.Providers.User
 * File: user.provider.client.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import * as React from 'react'
import { useAuth } from './auth.provider.client';

const UserContext = React.createContext({})

const UserProvider = props => (
    <UserContext.Provider value={useAuth().data} {...props} />
)

const useUser = () => React.useContext(UserContext);

export {UserProvider, useUser}
