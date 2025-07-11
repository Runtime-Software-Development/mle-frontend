/*!
 * MLE.Client.Components.Common.Dropdown
 * File: dropdown.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import {genID} from "../../utils/data.utils.client";

// generate unique ID value for menu items
const menuID = genID();

/**
 * Dropdown component.
 *
 * @param label
 * @param compact
 * @param items
 * @param size
 * @param icon
 * @public
 */

const Dropdown = ({label, compact, items, size ='lg', icon='add'}) => {

    const dropdown = React.useRef();

    // dropdown toggle view
    const [dropdownToggle, setDropdownToggle] = React.useState(false);

    // Add document click event listener to allow dropdown to close on body click
    React.useEffect(() => {
        // create hide dropdown function
        const hideDropdown = (e) => {
            if (dropdown.current && !dropdown.current.contains(e.target)) {
                setDropdownToggle(false);
            }
        }
        // add event listener to handle document click (to close dropdown)
        document.addEventListener('click', hideDropdown);
        // remove the event listener when component unmounts
        return () => {
            document.removeEventListener('click', hideDropdown);
        };
    });


    return <div>
        <Button
            icon={icon}
            size={size}
            label={!compact ? label : ''}
            onClick={(e) => {
                e.stopPropagation()
                setDropdownToggle(true);
            }}
        />
        <div ref={dropdown} className={`v-menu dropdown${dropdownToggle ? ' active' : ''}`}>
            <ul>
                {
                    // add submenu items
                    (items || []).map((item, index) => {
                        const {label='', type='', icon='', callback=()=>{}} = item || {};
                        return (
                            type && <li key={`${menuID}_${index}`}>
                                <Button
                                    icon={icon}
                                    type={type}
                                    label={label}
                                    onClick={(e) => {
                                        callback(e);
                                        setDropdownToggle(false);
                                    }}
                                />
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    </div>
}

export default Dropdown;
