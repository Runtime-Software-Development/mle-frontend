/*!
 * MLE.Client.Components.Selectors.Datetime
 * File: datetime.selector.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Flatpickr from 'react-flatpickr';

/**
 * Build datepicker widget using Flatpickr module.
 * - Reference: https://github.com/haoxins/react-flatpickr
 * - Demos and documentation: https://flatpickr.js.org
 *
 * @public
 * @param value
 * @param name
 * @param filter
 * @param onChange
 */

export const DateTimeSelector = ({ value, name, filter = 'datetime', onChange=()=>{} }) => {

    // initialize date/time input value
    let init;
    switch (filter) {
        case "datetime": init = value ? new Date(value) : value; break;
        case "date": init = value ? new Date(value) : value; break;
        default: init = value; break;
    }
    const [date, setDate] = React.useState(init);

    // select date picker format
    const dateSelectors = {
        datetime: <Flatpickr
            name={name}
            options={{
                altInput: true,
                dateFormat: 'Z',
            }}
            data-enable-time={true}
            value={date}
            onChange={(selectedDates, dateStr) => {
                const e = {target: {name: name, value: dateStr}};
                setDate(selectedDates);
                onChange(e);
            }} />,
        date: <Flatpickr
            name={name}
            options={{
                altInput: true,
                dateFormat: 'Y-m-d',
                altFormat: 'F d, Y',
            }}
            data-enable-time={false}
            value={date}
            onChange={(selectedDates, dateStr) => {
                const e = {target: {name: name, value: dateStr}};
                setDate(selectedDates);
                onChange(e);
            }} />,
        time: <Flatpickr
            name={name}
            options={{
                altInput: true,
                dateFormat: 'H:i:s',
                altFormat: 'H:i:ss',
                noCalendar: true,
            }}
            data-enable-time={true}
            value={date}
            onChange={(selectedDates, dateStr) => {
                const e = {target: {name: name, value: dateStr}};
                setDate(selectedDates);
                onChange(e);
            }} />,
    };
    return <>
        {
            dateSelectors.hasOwnProperty(filter)
                ? dateSelectors[filter]
                : dateSelectors.default
        }
    </>;
};

export default DateTimeSelector;