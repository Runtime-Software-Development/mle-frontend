/*!
 * MLE.Client.Components.Menus.Pagination
 * File: pagination.menu.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';

/**
 * Inline menu component to paginate results in viewer
 *
 * @public
 * @param {Object} data
 * @return {JSX.Element}
 */

const PaginationMenu = ({total, hasNext, hasPrev, onPrev, onNext}) => {

    return <div className={'pagination'}>
        {
            total > 0 &&
            <Button
                icon={'prev'}
                label={'Previous Page'}
                className={hasPrev ? 'prev' : 'inactive'}
                onClick={() => {
                    if (hasPrev) {onPrev()}
                }
                }
            />
        }
        {
            total > 0 &&
            <Button
                icon={'next'}
                type={'rightAlign'}
                className={hasNext ? 'next' : 'inactive'}
                label={'Next Page'}
                onClick={() => {
                    if (hasNext) {onNext()}
                }
                }
            />
        }
    </div>
};

export default PaginationMenu;