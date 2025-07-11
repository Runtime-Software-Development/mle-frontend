/*!
 * MLE.Client.Components.Common.Table
 * File: editor.js
 * Copyright(c) 2024 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 * 
 * Revisions
 * - 08-09-2024 Modified component.
 */

import React from 'react';
import Loading from './loading';
import Icon from "./icon";
import { compare, sanitize } from '../../utils/data.utils.client';

/**
 * Render table body. Filters item values not defined in
 * column array using column/item names as keys.
 *
 * @public
 * @param tableID
 * @param {Array} rows: [{name: DATA}]
 * @param {Array} cols: [{name: NAME, label: DATA}]
 * @return {JSX.Element}
 */

const TableBody = ({tableID, rows, cols}) => {
    const noop = ()=>{};
    return <tbody>{
        rows.map((row, index) => {
            return (
                <tr key={`${tableID}_row_${index}`} onClick={row.onClick || noop}>
                    {
                        cols
                            .filter(col => row.hasOwnProperty(col.name))
                            .map(col =>
                                <td
                                    key={`td_${index}_${col.name}`}
                                    className={row.className}>
                                    {
                                        col.hasOwnProperty('datatype') 
                                            ? sanitize(row[col.name], col.datatype) 
                                            : row[col.name]
                                    }
                                </td>
                            )
                    }
                </tr>
            );
        })
    }</tbody>
}

/**
 * Render table component.
 * - Input columns (cols) must be object of form:
 *   [...{name: <column name>, label: <column label>, defaultSort: <boolean>}]
 * - Input rows (rows) must be object of form:
 *   [...{[name]: {...[column name]: <row data>}]
 *
 * @public
 * @param {Array} rows
 * @param {Array} cols
 * @param {String} className (Optional)
 * @return {JSX.Element}
 */
const Table = ({ rows, cols, className=''}) => {

    /**
     * Generate unique ID value for table.
     * Used to generate unique IDs for table elements.
     * @type {String}
     */
    const tableID = Math.random().toString(16).substring(2);

    /**
     * Determine default sort field.
     * If no default sort is specified, the first column is used as the default sort.
     * @type {String}
     */
    const defaultSort = cols
        .filter(({ defaultSort }) => !!defaultSort)
        .map(({ name }) => name)
        .join();
    const [sortBy, setSortBy] = React.useState(defaultSort);
    const [order, setOrder] = React.useState(-1);
    const [datatype, setDatatype] = React.useState(null);

    /**
     * Sort table by column name.
     * @param {String} col
     */
    function _selectSort(col) {
        setSortBy(col?.name);
        setOrder(-order);
        setDatatype(col?.datatype);
    }

    /**
     * Sort table by column name.
     * @param {Object} a
     * @param {Object} b
     * @return {Number}
     */
    function _compareFn(a, b) {
        if (!sortBy) return 0;
        // ensure field value can be sorted by selected column name
        if (!a.hasOwnProperty(sortBy) || !b.hasOwnProperty(sortBy)) return 0;

        // sort by custom data type
        if (datatype === 'number') {
            return order * compare(Number(a[sortBy]), Number(b[sortBy]));
        }
        if (datatype === 'date' || datatype === 'datetime' || datatype === 'timestamp') {
            return order * compare(new Date(a[sortBy]), new Date(b[sortBy]));
        }
        if (datatype === 'boolean') {
            return order * compare(!!a[sortBy], !!b[sortBy]);
        }
        if (datatype === 'string') {
            return order * compare(String(a[sortBy]), String(b[sortBy]));
        }
        else {
            // default sort
            return order * compare(a[sortBy], b[sortBy]);
        }
    }

    /**
     * Render table component.
     * - Input columns (cols) must be object of form:
     *   [...{name: <column name>, label: <column label>, defaultSort: <boolean>}]
     * - Input rows (rows) must be object of form:
     *   [...{[name]: {...[column name]: <row data>}]
     *
     * @public
     * @param {Array} rows
     * @param {Array} cols
     * @param {String} className (Optional)
     * @return {JSX.Element}
     */
    return Array.isArray(rows) && Array.isArray(cols)
        ?
        <table className={className}>
            <thead>
            <tr>
                {
                    cols.map((col, index) =>
                        <th
                            key={`${tableID}_col_${index}`}
                            className={col.className}
                            onClick={() => {_selectSort(col)}}
                        >
                            <div className={'h-menu'} style={{cursor: 'pointer'}}>
                                <ul>
                                    <li>{col.label}</li>
                                    <li className={'push'} style={{visibility: `${col.name === sortBy ? 'visible' : 'hidden'}`}}>
                                        <Icon type={order === 1 ? 'up' : 'down'}/>
                                    </li>
                                </ul>
                            </div>
                        </th>)
                }
            </tr>
            </thead>
            <TableBody tableID={tableID} rows={rows.sort(_compareFn)} cols={cols} />
        </table>
        :
        <Loading/>
}

export default Table
