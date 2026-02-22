/*!
 * MLE.Client.Components.Navigator.Filter
 * File: filter.navigator.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Filter navigator component. Sets filtered stations to appear on map tool.
 *
 * ---------
 * Revisions
 * - 25-10-2025     Added boundary filtering options.

 */

import React from 'react';
import Form from '../common/form';
import { genSchema } from '../../services/schema.services.client';
import { useNav } from "../../providers/nav.provider.client";
import {useData} from "../../providers/data.provider.client";
import {useDialog} from "../../providers/dialog.provider.client";

/**
 * Navigator filter component.
 *
 * @public
 * @return {JSX.Element}
 */

function FilterNavigator() {

    const nav = useNav();
    const api = useData();
    const dialog = useDialog();

    // get filter options from global data provider
    const {
        surveyors=[],
        surveys=[],
        survey_seasons=[]
    } = api.options || {};

    // create filter data state
    const [filterData, setFilterData] = React.useState(nav.filter);
    
    /**
     * Returns a filtered array of select data options based on the owner ID.
     *
     * @param {Array} selectData - array of select data options
     * @param {string} ownerID - owner ID to filter by
     * @returns {Array} filtered array of select data options
     */
    const filterOptions = (selectData, ownerID) => {
        return (selectData || [])
            .filter(item => parseInt(item.owner_id) === parseInt(ownerID))
    }
    
    /**
     * Updates the filter data state with the selected input value.
     * 
     * @param {Object} event - the change event object
     * @param {string} event.target.name - the name of the filter input
     * @param {string} event.target.value - the selected value of the filter input
     */
    const handleFilterChange = ({target: {name, value}}) => {
        const updates = {
            surveyors: () => setFilterData(data => ({...data, surveyors: value})),
            surveys: () => setFilterData(data => ({...data, surveys: value, survey_seasons: ''})),
            survey_seasons: () => setFilterData(data => ({...data, survey_seasons: value})),
            status: () => setFilterData(data => ({...data, status: value}))
        };

        // Update filter data state with input selection
        if (updates.hasOwnProperty(name)) updates[name]();
    };

    // filter options based on selected values
    let surveyorID = filterData.hasOwnProperty('surveyors') && filterData.surveyors;
    let surveyID = filterData.hasOwnProperty('surveys') && filterData.surveys;
    const filteredSurveys = filterOptions(surveys, surveyorID);
    const filteredSurveySeasons = filterOptions(survey_seasons, surveyID);

    // data utils
    const _loader = async () => {return filterData}

    return <Form
        key={'filter-stations-form'}
        model={'stations'}
        opts={
            {
                surveyors: surveyors,
                surveys: filteredSurveys,
                survey_seasons: filteredSurveySeasons
            }
        }
        loader={_loader}
        schema={genSchema({ view:'filterNavigation', model:'stations'})}
        onReset={()=>{
            setFilterData({});
        }}
        onCancel={() => {dialog.cancel()}}
        onChange={handleFilterChange}
        callback={async ()=>{
            nav.setFilter(filterData)
            dialog.clear();
        }}
        allowEmpty={true}
    />

}


export default FilterNavigator;