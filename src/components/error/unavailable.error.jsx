/*!
 * MLE.Client.Components.Error.Unavailable
 * File: unavailable.error.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

import React from "react";
import Logo from '../common/logo';
import Button from '../common/button';
import { useRouter } from '../../providers/router.provider.client';

/** Interval in ms between automatic reconnect attempts */
const RECONNECT_INTERVAL_MS = 8000;

const UnavailableError = () => {
    const { tryReconnect } = useRouter();
    const [checking, setChecking] = React.useState(false);

    // Auto-recovery: probe API periodically; when it succeeds, app returns to normal
    React.useEffect(() => {
        const id = setInterval(() => {
            tryReconnect();
        }, RECONNECT_INTERVAL_MS);
        return () => clearInterval(id);
    }, [tryReconnect]);

    const handleRetry = async () => {
        setChecking(true);
        await tryReconnect();
        setChecking(false);
    };

    return (
        <div className="page-content">
            <main>
                <div className={'maintenance'}>
                    <Logo colour={'black'} />
                    <h2>The Mountain Legacy Project Explorer is currently unavailable</h2>
                    <p>Sorry, this application is currently undergoing maintenance
                        and is not available.</p>
                    <p>Please check back soon for updates.</p>
                    <p>
                        <Button
                            type="submit"
                            label={checking ? 'Checking…' : 'Try again'}
                            onClick={handleRetry}
                            disabled={checking}
                            spin={checking}
                        />
                    </p>
                </div>
            </main>
        </div>
    );
}

export default UnavailableError;
