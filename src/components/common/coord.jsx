/*!
 * MLE.Client.Components.Common.Coord
 * File: coord.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Input fields for either coordinates using degree/minute/second or decimal formats.
 *
 * ---------
 * Revisions
 * - 16-09-2023   Converted log/lat display to DMS.
 */

import React from 'react';
import {convertCoordDeg} from "../../utils/data.utils.client";

/**
 * Coordinate input component.
 *
 * @public
 * @param id
 * @param name
 * @param selected
 * @param required
 */

const Coord = ({ id, name, value, required, onChange, readOnly, ariaLabel }) => {

    /**
     * Convert decimal coordinate to DMS
     *
     * @public
     * @param decimal
     */

    function convertDMS(decimal) {
        const absolute = Math.abs(decimal);
        const degrees = Math.floor(absolute);
        const minutesNotTruncated = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesNotTruncated);
        const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

        return {
            degrees: degrees,
            minutes: minutes,
            seconds: seconds
        }
    }

    // current value in deg / min / sec format
    const [dms,  setDMS] = React.useState(convertDMS(value));

    // update degrees field
    const _updateDegrees = (e) => {
        const { target={} } = e || {};
        const { value='' } = target || {};
        setDMS({degrees: value, minutes: dms.minutes, seconds: dms.seconds});
        // convert DMS -> decimal
        onChange({
            target: {
                name: name,
                value: convertCoordDeg(value, dms.minutes, dms.seconds)
            }
        });
    };

    // update minutes field
    const _updateMinutes = (e) => {
        const { target={} } = e || {};
        const { value='' } = target || {};
        setDMS({degrees: dms.degrees, minutes: value, seconds: dms.seconds});
        // convert DMS -> decimal
        onChange({
            target: {
                name: name,
                value: convertCoordDeg(dms.degrees, value, dms.seconds)
            }
        });
    };

    // update seconds field
    const _updateSeconds = (e) => {
        const { target={} } = e || {};
        const { value='' } = target || {};
        setDMS({degrees: dms.degrees, minutes: dms.minutes, seconds: value});
        // convert DMS -> decimal
        onChange({
            target: {
                name: name,
                value: convertCoordDeg(dms.degrees, dms.minutes, value)
            }
        });
    };

    // update decimal field
    const _updateDecimal = (e) => {
        const { target={} } = e || {};
        const { value='' } = target || {};
        setDMS(convertDMS(value));
        onChange({
            target: {
                name: name,
                value: value
            }
        });
    };

    return <div className={'coord'}>
        <div className={'h-menu'}>
            <ul>
                <li>
                    <input
                        readOnly={readOnly}
                        type={'number'}
                        step={'any'}
                        min={name === 'lat' ? -90 : -180}
                        max={name === 'lat' ? 90 : 180}
                        id={id + '_degrees'}
                        name={'degrees'}
                        value={dms.degrees || 0}
                        required={required}
                        onChange={_updateDegrees}
                        aria-label={ariaLabel}
                    />
                    {'\u00B0\u00A0\u00A0'}
                    <input
                        readOnly={readOnly}
                        type={'number'}
                        step={'any'}
                        id={id + '_minutes'}
                        name={'minutes'}
                        min={0}
                        value={dms.minutes || 0}
                        required={required}
                        onChange={_updateMinutes}
                        aria-label={ariaLabel}
                    />
                    {'\u2032\u00A0\u00A0'}
                    <input
                        readOnly={readOnly}
                        type={'number'}
                        step={'any'}
                        id={id + '_seconds'}
                        name={'seconds'}
                        min={0}
                        value={dms.seconds || 0}
                        required={required}
                        onChange={_updateSeconds}
                        aria-label={ariaLabel}
                    />
                    {'\u2033\u00A0'}
                </li>
                <li className={'push'}>
                    {'Decimal\u00A0'}
                    <input
                        readOnly={readOnly}
                        type={'number'}
                        step={'any'}
                        min={name === 'lat' ? -90 : -180}
                        max={name === 'lat' ? 90 : 180}
                        id={id}
                        name={name}
                        value={value || ''}
                        required={required}
                        onChange={_updateDecimal}
                        aria-label={ariaLabel}
                    />
                </li>
            </ul>
        </div>
    </div>;
};

export default Coord;