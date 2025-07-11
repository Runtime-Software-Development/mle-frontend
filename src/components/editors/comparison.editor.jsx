/**
 * MLP.Client.Components.Editors.Comparison
 * File: comparison.editor.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 * 
 * Description: 
 * 
 * React component rendered as a capture comparison selector widget used 
 * to select a capture pair. It takes in several props including name, 
 * value, reference, and onSelect. The component uses React hooks such 
 * as useRouter, useUser, useState, and useEffect to manage state and 
 * perform side effects. In the useEffect hook, it makes an API request 
 * to fetch available and selected captures based on the reference prop. 
 * It handles the response and updates the component's state accordingly.
 * The component renders a list of available captures and allows the user 
 * to select and deselect captures. It uses the onSelect prop to 
 * communicate the selected capture IDs to the parent component.
 * 
 * If there is an error or no captures are available, it displays an 
 * error message. Otherwise, it renders a list of available captures 
 * and allows the user to select and deselect captures.
 * 
 * The component also includes some helper functions _handleSelectCapture 
 * and _handleDeselectCapture to handle the selection and deselection of 
 * captures.
 * 
*/

import {useRouter} from "../../providers/router.provider.client";
import {useUser} from "../../providers/user.provider.client";
import React from "react";
import {UserMessage} from "../common/message";
import {genID, sorter} from "../../utils/data.utils.client";
import Image from "../common/image";
import Loading from "../common/loading";

// generate unique ID value for selector inputs
const keyID = genID();

/**
 * Capture comparison selector widget. Used to select a capture pair.
 *
 * @public
 * @param {String} name
 * @param {Array} value - an array of capture IDs
 * @param {Object} reference - an object containing the type (either 'historic_captures' or 'modern_captures') and the ID of the capture
 * @param onSelect - a function to call when a capture is selected, passing the capture ID and the type of the capture
 */
export const ComparisonEditor = ({
                                     name,
                                     value = [],
                                     reference = {},
                                     onSelect = () => {},
                                 }) => {

    const router = useRouter();
    const user = useUser();
    const _isMounted = React.useRef(false);
    const [message, setMessage] = React.useState(null);
    const [error, setError] = React.useState(false);
    const [loaded, setLoaded] = React.useState(false);

    // set capture selection states
    const [availableCaptures, setAvailableCaptures] = React.useState([]);

    /**
     * Load available and selected captures.
     */

    React.useEffect(() => {
        _isMounted.current = true;

        // request captures for comparison
        if (!error && !loaded && reference) {
            router.get('/compare/' + reference.owner.id)
                .then(res => {
                    if (_isMounted.current) {

                        // handle response errors
                        if (!res || res.error) {
                            setError(true);
                            return res.hasOwnProperty('error')
                                ? setMessage(res.error)
                                : setMessage({msg: 'Error occurred.', type: 'error'}
                                );
                        }

                        // get capture data (if available)
                        const {response = {}} = res || {};
                        const {data = {}} = response || {};
                        const {available = [], selected = []} = data || {};
                        const key = reference.type === 'historic_captures'
                            ? 'modern_captures'
                            : 'historic_captures';

                        // no capture data is available
                        if (available.length === 0) {
                            setError(true);
                            setMessage({msg: `No captures available.`, type: 'info'});
                        }

                        // filter available / selection captures:
                        setLoaded(true);
                        onSelect(
                            name,
                            selected
                                .filter(capture => capture[reference.type] === reference.id)
                                .map(capture => {
                                    return capture[key];
                                })
                        );
                        setAvailableCaptures(available);
                    }
                });
        }
        return () => {
            _isMounted.current = false;
        };
    }, [reference]);

    // add capture to selection
    const _handleSelectCapture = (captureID) => {
        if (!value.includes(captureID)) {
            onSelect(name, [...value, captureID]);
        }
    };

    // remove capture from selection
    const _handleDeselectCapture = (captureID) => {
        onSelect(name, value.filter(id => id !== captureID));
    };

    return <>
        {
            message && <UserMessage closeable={false} message={message}/>
        }
        {
            user && Array.isArray(availableCaptures) && availableCaptures.length > 0 ?
                <div className={'h-menu selector'}>
                    <ul> {(availableCaptures || [])
                        .sort(sorter)
                        .map((capture, index) => {
                            const {refImage = {}, node = {}} = capture || {};
                            return (
                                <li key={`selector_${keyID}_input_${index}`}>
                                    <label
                                        className={value.includes(node.id) ? 'selected' : ''}
                                        style={{textAlign: 'center'}}
                                        key={`label_selection`}
                                        htmlFor={`selector_${keyID}_input_${index}`}
                                    >
                                        <Image
                                            url={refImage.url}
                                            scale={'thumb'}
                                            title={`Select ${refImage.label || ''} for comparison.`}
                                            caption={refImage.label}
                                            onClick={() => {
                                                value.includes(node.id)
                                                    ? _handleDeselectCapture(node.id)
                                                    : _handleSelectCapture(node.id);
                                            }}
                                        />
                                        <input
                                            readOnly={true}
                                            checked={value.includes(node.id)}
                                            type={'checkbox'}
                                            name={`capture_input_${index}`}
                                            id={`selector_${keyID}_input_${index}`}
                                            value={node.id}
                                            onClick={() => {
                                                value.includes(node.id)
                                                    ? _handleDeselectCapture(node.id)
                                                    : _handleSelectCapture(node.id);
                                            }}
                                        />Compare
                                    </label>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                : message ? '' : <Loading/>
        }
    </>;
};
