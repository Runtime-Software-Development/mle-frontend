/*!
 * MLE.Client.Components.Toolkit.Panel.Controller
 * File: panel.controller.alignment.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Panel controller maps the methods or operations applied to the user actions (mouse and key events)
 * for the control canvas in the panel canvas stack. The controller also applies parallel pointer operations
 * mapped to events.
 *
 * ---------
 * Revisions
 * - 09-07-2023   Major upgrade to Toolkit incl. UI and workflow improvements and OpenCV integration
 */

import {useIat} from "../../../providers/alignment.provider.client";

/**
 * Image Analysis Toolkit: Canvas contol event hook
 */

export const useController = (id) => {

    const iat = useIat();
    const panel = iat[id];

    /**
     * Handle canvas user event.
     */

    const _handleEvent = (e, _handler) => {
        return _handler(e, panel.properties, panel.pointer, iat.options) || {};
    };

    /**
     * Handle canvas mouse up event.
     * - deselect pointer selected point
     */

    const _handleMouseUp = (e) => {
        e.preventDefault();
        panel.pointer.deselect();
        return _handleEvent(e, panel.methods.onMouseUp);
    };

    /**
     * Handle canvas mouse down event.
     * - add selected click coordinate to pointer
     */

    const _handleMouseDown = (e) => {
        e.preventDefault();
        panel.pointer.select(e);
        return _handleEvent(e, panel.methods.onMouseDown);
    };

    /**
     * Handle canvas mouse move event.
     * - set pointer to position (x, y) of cursor
     */

    const _handleMouseMove = e => {
        e.preventDefault();
        panel.pointer.set(e);
        return _handleEvent(e, panel.methods.onMouseMove);
    };

    /**
     * Handle canvas mouse move event.
     * - reset pointer to (0, 0)
     */

    const _handleMouseOut = (e) => {
        e.preventDefault();
        panel.pointer.reset();
        return _handleEvent(e, panel.methods.onMouseOut);
    };

    /**
     * Filter input key presses for image methods.
     * - selects methods for given key press.
     *
     * @private`
     */

    const _handleOnKeyDown = (e) => {
        const {keyCode = ''} = e || {};
        const _methods = {
            // disable control point selection (uses [ALT] key)
            18: () => {
                iat.setMode('select');
            },
            // enable magnifier (uses [SHIFT] key)
            16: () => {
                iat.panel1.pointer.magnifyOn();
                iat.panel2.pointer.magnifyOn();
            }
        };
        // suppress other keyboard press methods if method is defined
        if (_methods.hasOwnProperty(keyCode)) {
            e.preventDefault();
            _methods[keyCode]();
        }

    };

    /**
     * Filter input key presses for image methods.
     * - selects methods for given key press.
     *
     * @private
     * @return {JSX.Element}
     */

    const _handleOnKeyUp = (e) => {
        const {keyCode = ''} = e || [];
        const _methods = {
            // disable control point selection (uses [ALT] key)
            18: () => {
                iat.setMode('pan');
            },
            // disable magnifier (uses [SHIFT] key)
            16: () => {
                iat.panel1.pointer.magnifyOff();
                iat.panel2.pointer.magnifyOff();
            }
        };
        // suppress other keyboard press methods if method is defined
        if (_methods.hasOwnProperty(keyCode)) {
            e.preventDefault();
            _methods[keyCode]();
        }
    };

    return {
                onMouseOut: _handleMouseOut,
                onMouseDown: _handleMouseDown,
                onMouseMove: _handleMouseMove,
                onMouseUp: _handleMouseUp,
                onKeyUp: _handleOnKeyUp,
                onKeyDown: _handleOnKeyDown,
            }
};

