/*!
 * MLE.Client.Utilities.Validator
 * File: validator.utils.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import { getError } from '../services/schema.services.client';

/**
 * Export validator instance.
 */

export default Validator;

/**
 * Create input data validator.
 *
 * @param {Array} validations
 * @public
 */

function Validator(validations) {
    this.validations = ( typeof validations !== "undefined" ) ? validations : [];

    // resolve validation methods
    // default is a no-op that returns the value.
    this.checks = validations.map(check => {
        return _inputValidations.hasOwnProperty(check)
          ? {
                name: check,
                run: _inputValidations[check]
            }
          : {
                name: check,
                run: (value) => {
                    return value;
                }
            };
    });
}

/**
 * Apply validation checks to value and return any errors
 * on failure.
 *
 * @public
 * @param {String} val1
 * @param {String} val2 (Optional)
 * @return {String} error
 */

Validator.prototype.check = function check(val1, val2='') {
    return this.checks
        .filter(check => !check.run(val1, val2))
        .reduce((o, check) => {
            return { msg: getError(check.name, 'validation'), type: 'error' };
        }, {});
}

/**
 * Validation functions.
 *
 * @private
 */

const _inputValidations =
    {
        /**
         * Validate required input.
         */

        isRequired: (value) => {
            return !!value;
        },

        /**
         * Validate required input.
         */

        isSelected: (value) => {
            return !!value;
        },

        /**
         * Validate required input.
         */

        isMultiSelected: (value) => {
            return !!(Array.isArray(value) && value.length > 0);
        },

        /**
         * Validate files are selected.
         */

        filesSelected: (files) => {
            return !!(files && files.length > 0);
        },

        /**
         * Validate latitude value.
         */

        isLatitude: (value) => {
            return !!(value <= 90 && value >= -90);
        },

        /**
         * Validate longitude value.
         */

        isLongitude: (value) => {
            return !!(value <= 180 && value >= -180);
        },

        /**
         * Validate azimuth value.
         */

        isAzimuth: (value) => {
            return !!(value < 360 && value >= 0);
        },

        /**
         * Validate JSON value.
         * Reference: https://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string
         * Retrieved: 06-01-2024
         */

        isJSON: (value) => {
            try {
                const o = JSON.parse(value);

                // Handle non-exception-throwing cases:
                // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
                // but... JSON.parse(null) returns null, and typeof null === "object",
                // so we must check for that, too. Thankfully, null is falsey, so this suffices:
                if (o && typeof o === "object") {
                    return o;
                }
            }
            catch (e) { }

            return false;
        },

        /**
         * Validate email address.
         */

        isEmail: (value) => {
            return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)?$/.test(value);
        },

        /**
         * Validate password value. Uses format: Minimum eight and maximum
         * 10 characters, at least one uppercase letter, one lowercase letter,
         * one number and one special character
         */

        isPassword: (value) => {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(value);
        }
    }