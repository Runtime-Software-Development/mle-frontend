/*!
 * MLE.Client.Components.Common.Accordion
 * File: accordion.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import { createNodeRoute } from '../../utils/paths.utils.client';
import { useRouter } from '../../providers/router.provider.client';
import Button from './button';

/**
 * Inline vertical accordion menu component.
 * - Creates accordion containers for dependent nodes that can
 *   be toggled.
 *
 * @public
 * @param {String} className
 * @param type
 * @param label
 * @param id
 * @param open
 * @param menu
 * @param hasDependents
 * @param hideOnClick
 * @param children
 * @return {JSX.Element}
 */

const Accordion = ({
                       className='',
                       type='',
                       label='',
                       id='',
                       open=false,
                       menu=null,
                       hasDependents=false,
                       hideOnClick=false,
                       children=null
                   }) => {

    const router = useRouter();

    // accordion toggle state
    const [toggle, setToggle] = React.useState(open);
    const dropdown = React.useRef();

    // Add document click event listener to allow dropdown to close on body click
    React.useEffect(() => {
        if (hideOnClick) {
            // create hide dropdown function
            const hideDropdown = (e) => {
                if (dropdown.current && !dropdown.current.contains(e.target)) {
                    setToggle(false);
                }
            }
            // add event listener to handle document click (to close dropdown)
            document.addEventListener('click', hideDropdown);
            // remove the event listener when component unmounts
            return () => {
                document.removeEventListener('click', hideDropdown);
            };
        }
    });

    // toggle accordion data display
    const _handleToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setToggle(!toggle);
    }

    // toggle accordion data
    const _handleView = (e) => {
        e.stopPropagation();
        id ? router.update(createNodeRoute(type, 'show', id)) : setToggle(!toggle);
    }

    return <div className={`accordion ${className}`}>
        <div className={`h-menu ${type}`}>
            <ul>
                {
                    (hasDependents || children) &&
                    <li key={`accordion_toggle`}>
                        <Button
                            icon={toggle ? 'vopen' : 'vclose'}
                            title={toggle ? 'Collapse' : 'Expand'}
                            onClick={_handleToggle}
                        />
                    </li>
                }
                {
                    type && children &&
                    <li key={`accordion_icon`}>
                        <Button
                            icon={type}
                            title={toggle ? 'Collapse' : 'Expand'}
                            onClick={_handleView} />
                    </li>
                }
                {
                    label &&
                    <li key={`accordion_label`}>
                        <Button
                            title={`View ${label}.`}
                            onClick={_handleView}
                            label={label}
                        />
                    </li>
                }
                {
                    menu && <li key={`accordion_menu`} className={'accordion-menu'}>{ menu }</li>
                }
            </ul>
        </div>
        <div ref={dropdown} className={`accordion-data ${toggle ? 'open' : ''}`}>
            { toggle && <>{children}</> }
        </div>
    </div>
}

export default Accordion;