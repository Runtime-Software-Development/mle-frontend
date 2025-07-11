/*!
 * MLE.Client.Components.Navigator.Filter
 * File: filter.navigator.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Filter navigator component. Sets filtered stations to appear on map tool.
 *
 * ---------
 * Revisions

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

    // get filter options
    const {
        surveyors=[],
        surveys=[],
        survey_seasons=[]
    } = api.options || {};

    // create filter data state
    const [filterData, setFilterData] = React.useState(nav.filter);

    // filter options by owner ID
    const filterOptions = (selectData, ownerID) => {
        return (selectData || [])
            .filter(item => parseInt(item.owner_id) === parseInt(ownerID))
    }

    // filter options by owner ID
    const onChange = (e) => {
        const {target={}} = e || {};
        const { name='', value=''} = target;
        const updates = {
            surveyors: ()=>{
                setFilterData({ surveyors: value });
            },
            surveys: ()=>{
                setFilterData(data => ({...data, surveys: value, survey_seasons: ''}));
            },
            survey_seasons: ()=>{
                setFilterData(data => ({...data, survey_seasons: value}));
            },
            status: ()=>{
                setFilterData(data => ({...data, status: value}));
            },
        }

        // update filter data state with input selection
        if (updates.hasOwnProperty(name)) updates[name]();

    }

    // filter options based on selected values
    let surveyorID = filterData.hasOwnProperty('surveyors') && filterData.surveyors;
    let surveyID = filterData.hasOwnProperty('surveys') && filterData.surveys;
    const filteredSurveys = filterOptions(surveys, surveyorID);
    const filteredSurveySeasons = filterOptions(survey_seasons, surveyID);

    // data utils
    const _loader = async () => {return filterData}

    return <Form
        key={'filter_by_survey'}
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
        onChange={onChange}
        callback={async ()=>{
            nav.setFilter(filterData)
            dialog.clear();
        }}
        allowEmpty={true}
    />

}


export default FilterNavigator;