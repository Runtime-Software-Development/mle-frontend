/*!
 * MLE.Client.Providers.Dialog
 * File: dialog.provider.client.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * -----------
 * Description
 *
 * Dialog provider is a React Context used to store and share data across all components
 * for dialog and tooltip pop-ups. Multiple dialogs can be stacked; only the top dialog is
 * shown. Closing a dialog reveals the next one in the stack (if it exists).
 *
 * Tooltips are positionable popup messages that overlay the content.
 *
 * ------
 * States
 * - stack {Array}:         Array of dialog metadata for the dialog stack.
 * - tooltip {Object}:      Tooltip metadata
 *
 * ---------
 * Revisions
 * - 09-07-2023   Added tooltip text state to show popup messages
 *
 */

import * as React from 'react'

/**
 * Global navigation data provider.
 *
 * @public
 */

const DialogContext = React.createContext({});

/**
 * Provider component to allow consuming components to subscribe to
 * API request handlers.
 *
 * @public
 * @param {Object} props
 */

function DialogProvider(props) {

    // tree and map data states
    const [stack, setStack] = React.useState([]);

    // Tooltip
    const [tooltip, setToolTip] = React.useState(null);

    // set dialog state
    // - uses a simple stack to store multiple dialogs
    const _setDialog = (data) => {
        // push dialog to top of stack
        setStack(previousData => [data, ...previousData]);
    }

    // clear all navigator dialogs
    const _clearDialog = () => {
        setStack([]);
    }

    // pop stack
    const _cancelDialog = () => {
        setStack(current => current.filter((_, index) => {return index !== 0}));
    }

    return (
        <DialogContext.Provider value={
            {
                current: stack.length > 0,
                count: stack.length,
                hidden: stack.length > 1,
                stack: stack,
                setCurrent: _setDialog,
                cancel: _cancelDialog,
                clear: _clearDialog,
                tooltip: tooltip,
                setTooltip: setToolTip
            }
        } {...props} />
    )

}

const useDialog = () => React.useContext(DialogContext);
export { useDialog, DialogProvider };


