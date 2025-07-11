/*!
 * MLE.Client.Services.Schema
 * File: schema.services.client.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import { schema } from '../schema';
import { capitalize } from '../utils/data.utils.client';

/**
 * Get app metadata.
 *
 * @public
 * @return {{}} metadata
 */

export const getInfo = () => {
    const { app={} } = schema || {};
    return app;
}

/**
 * Get static view render index from given route. Unlike data
 * views, static views do not require input data from API requests.
 *
 * @public
 * @return {String} static view type
 * @param uri
 */

export const getStaticView = (uri) => {
    const routes = getRoutes();

    if (!uri) return '/not_found';

    // filter static files
    if (uri.indexOf('/resources') === 0) {
        return 'resources';
    }

    // filter route of query string
    const route = uri.split('?')[0];

    // lookup route in schema
    const routeData = routes.hasOwnProperty(route) ? routes[route] : {};
    return routeData.hasOwnProperty('name') ? routeData.name : null;
}

/**
 * Get route data from schema.
 *
 * @public
 * @return {{}} static route
 */

export const getRoutes = () => {
    const { routes={} } = schema || {};
    return routes;
}

/**
 * Get label for static view.
 *
 * @public
 * @param {String} route
 * @return {String} static view label
 */

export const getStaticLabel = (route) => {

    if (!route) return 'Not Found';

    // remove query
    route = route.split('?')[0];
    const { routes={} } = schema || {};
    return routes.hasOwnProperty(route) ? routes[route].label : '';
}

/**
 * Get error message based on error type and key.
 *
 * @param {String} key
 * @param {String} type
 * @public
 */

export const getError = (key='', type='') => {
    const errorSchema = schema.errors.hasOwnProperty(type) ? schema.errors[type] : null;
    return errorSchema
        ? errorSchema.hasOwnProperty(key)
            ? errorSchema[key]
            : schema.errors.default
        : schema.errors.default;
}

/**
 * Returns render code for view/model. Model and view labels
 * must be unique.
 *
 * @public
 * @param {String} view
 * @param {String} model
 * @return {String} view type
 */

export const getRenderType = (view, model) => {
    const { render=view } = _getViewAttributes(view, model);
    return render;
}

/**
 * Retrieve label for model from schema.
 *
 * @param {String} view
 * @return {String} label
 * @public
 */

export const getViewLabel = (view) => {
    if (schema.views.hasOwnProperty(view)) {
        const { label = capitalize(view) } = schema.views[view] || {};
        return label;
    }
    return '';
}

/**
 * Retrieve label for model from schema.
 *
 * @param {String} model
 * @param {String} type
 * @return {String} label
 * @public
 */

export const getModelLabel = (model, type='singular') => {
    if (schema.models.hasOwnProperty(model)) {
        const { attributes = {} } = schema.models[model] || {};
        return attributes.hasOwnProperty(type)
            ? schema.models[model].attributes[type]
            : '';
    }
    return '';
}



/**
 * Retrieve dependent types for model from schema.
 *
 * @param {String} model
 * @return {String} dependent types
 * @public
 */

export const getDependentTypes = (model) => {
    return schema.models.hasOwnProperty(model)
        ? schema.models[model].attributes.hasOwnProperty('dependents')
            ? schema.models[model].attributes.dependents
            : ''
        : '';
}

/**
 * Get order of node in tree.
 *
 * @public
 * @param {String} type
 * @return {Object} message
 */

export const getNodeOrder = (type) => {
    const modelSchema = schema.models.hasOwnProperty(type)
        ? schema.models[type] : '';
    const { attributes={} } = modelSchema || {};

    return attributes.hasOwnProperty('order') ? attributes.order : 0;
}

/**
 * Check if file type is a Capture.
 *
 * @public
 * @param {String} type
 * @return {Boolean}
 */

export const isCaptureType = (type) => {
    return schema.captures.types.includes(type);
}

/**
 * Check if file type is an image.
 *
 * @public
 * @param {String} type
 * @return {Boolean}
 */

export const isImageType = (type) => {
    return schema.imageTypes.includes(type);
}

/**
 * Returns schema attributes for view/model. Model and view labels
 * must be unique.
 *
 * @public
 * @param {String} view
 * @param {String} model
 * @return {Object} view attributes
 */

const _getViewAttributes = (view, model) => {

    // check if model has specified view
    const modelView = schema.views.hasOwnProperty(model)
        ? schema.views[model].hasOwnProperty(view)
            ? schema.views[model][view]
            : null
        : null;

    // Otherwise use default view
    const defaultView = schema.views.hasOwnProperty(view)
        ? schema.views[view]
        : null;

    return modelView ? modelView : defaultView ? defaultView : {};
}

/**
 * Load view settings for model.
 *
 * @public
 * @param {String} view
 * @param {String} model
 * @param {String} fieldsetKey
 * @param {Object} user
 * @return {Object} schema
 */

export const genSchema = ({ view='', model='', fieldsetKey= '', user= null }) => {

    // get user role
    const {role = ['']} = user || {};

    // model schema configuration
    const modelSchema = schema.models.hasOwnProperty(model) ? schema.models[model] : {};

    // view schema configuration
    const viewAttributes = _getViewAttributes(view, model);

    // does the schema include file uploads?
    let hasFiles = false;

    /** create renderable elements based on schema
     *  - filters out omitted fields (array) for requested view.
     *  - set in schema 'restrict' settings (list of views restricted for showing the field).
     *  - when 'restrict' is absent, field is not restricted by view type.
     *  - set in schema 'user' settings (list of user roles restricted for showing the field).
     *  - when 'users' is absent, field is not restricted by user role.
     *  - an empty 'restrict' array omits the field from all views.
     *  - (Optional) load initial values from input data
     */

    const filteredFieldsets = modelSchema.hasOwnProperty('fieldsets') ?
        modelSchema.fieldsets
            .filter(fieldset =>
                (
                    !fieldset.hasOwnProperty('restrict') || fieldset.restrict.includes(view)
                )
                &&
                (
                    !fieldsetKey || fieldset.hasOwnProperty(fieldsetKey)
                )
            )
            .filter(fieldset =>
                (
                    !fieldset.hasOwnProperty('users') || fieldset.users.includes(role[0])
                )
                &&
                (
                    !fieldsetKey || fieldset.hasOwnProperty(fieldsetKey)
                )
            )
            .map((fieldset, index) => {

                const { render = '', legend = '', collapsible=true } = fieldset || {};

                // filter fields
                let filteredFields = Object.keys(fieldset)
                    .filter(fieldKey =>
                        fieldKey !== 'legend'
                        && fieldKey !== 'render'
                        && fieldKey !== 'collapsible'
                        && fieldKey !== 'restrict'
                        && fieldKey !== 'users'
                        && (
                            !fieldset[fieldKey].hasOwnProperty('restrict')
                            || fieldset[fieldKey].restrict.includes(view)
                        ),
                    )
                    .map(fieldKey => {

                        // get field render type
                        const _render = fieldset[fieldKey].hasOwnProperty('render')
                            ? fieldset[fieldKey].render
                            : 'text';

                        // does the field have attached files?
                        hasFiles = _render === 'file' || _render === 'files' ? true : hasFiles;

                        // is the field readonly?
                        const _readonly = fieldset[fieldKey].hasOwnProperty('readonly');

                        return {
                            name: render === 'multiple' ? `${fieldKey}[0]` : fieldKey,
                            id: fieldKey,
                            index: index,
                            label: fieldset[fieldKey].label,
                            attributes: fieldset[fieldKey],
                            render: _render,
                            readonly: _readonly,
                            validate: fieldset[fieldKey].hasOwnProperty('validate')
                                ? fieldset[fieldKey].validate
                                : [],
                            reference: fieldset[fieldKey].hasOwnProperty('reference')
                                ? fieldset[fieldKey].reference
                                : '',
                        };
                    })
                    .reduce((o, field) => {
                        o[field.name] = field;
                        return o;
                    }, {});
                return {
                    id: index,
                    legend: legend,
                    collapsible: collapsible,
                    render: render,
                    fields: filteredFields,
                };
            })
        :[];

    return {
        model: model,
        view: view,
        hasFiles: hasFiles,
        attributes: viewAttributes,
        fieldsets: filteredFieldsets
    }
}