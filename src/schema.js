/*!
 * MLE.Client.Schema
 * File: schema.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * MLP data model schema
 * Description: This is a configuration document for defining rendering, labelling, routing,
 * input validation, node/file relations and other settings for the client-side web application.
 *
 * Schema Structure
 * - app: Global settings
 * - routes: list of static router endpoints
        <ROUTEURI>: {
            name: <ROUTENAME>,
            label: <Route label>
        }
 * - errors
 * - messages
 * - views
 * - captures
 * - imageTypes: defined image data model types
 * - excluded: file types to be excluded from
 * - models:
 *      <MODELNAME>: {
            attributes: {
                order: <Order of appearances in lists - Not Used>,
                label: <Model label (plural)>,
                singular: <Model label (singular)>
            },
            fieldsets: [
                {
                    legend: <fieldset legend text>,
                    restrict: [<list of applicable views>],
                    users: [<list of authorized user roles>],
                    <FIELDNAME>: {
                        label: <field label>,
                        render: <field format>,
                        validate: [<list of validation checks>]
                    },
 * ...
                },
 *
 * ---------
 * Revisions
 * - 02-12-2023   Include KMZ metadata files for surveys and survey seasons
 * - 23-12-2023   Added new 'map_objects' file type with schema.
 */
        
export const schema = {
    app: {
        project: "Mountain Legacy Project",
        name: "Explorer",
        title: "Capturing change in Canada's mountains",
        url: "https://explore.mountainlegacy.ca",
        mlp_url: 'https://mountainlegacy.ca',
        version: "2.0.0"
    },
    routes: {
        '/': {
            name: 'dashboard',
            label: ''
        },
        '/toolkit': {
            name: 'imageToolkit',
            label: 'Alignment Tool'
        },
        '/admin': {
            name: 'admin',
            label: 'Administration Panel'
        },
        '/not_found': {
            name: 'notFound',
            label: '404 Not Found'
        },
        '/unavailable': {
            name: 'unavailable',
            label: 'Unavailable'
        },
        '/server_error': {
            name: 'serverError',
            label: 'Server Error'
        },
        '/nodes': {
            redirect: '/not_found'
        },
        '/refresh': {
            redirect: '/not_found'
        }
    },
    errors: {
        default: 'An error has occurred. Please contact the site administrator.',
        image: {
            fallbackSrc: '/fallback_img.png'
        },
        validation: {
            isRequired: 'This field is required.',
            isSelected: 'Please select an item.',
            isMultiSelected: 'Please select at least one option or item.',
            filesSelected: 'Please select files to upload.',
            isLatitude: 'Latitude is invalid.',
            isLongitude: 'Longitude is invalid.',
            isAzimuth: 'Azimuth is invalid.',
            isEmail: 'Not a valid email address.',
            isPassword: 'Passwords must have a minimum eight and maximum 20 characters, at least one uppercase letter, one lowercase letter, one number and one special character',
            isValidForm: 'Form not valid.',
            isJSON: 'Not valid JSON',
            isRepeatPassword: 'Passwords do not match.'
        },
        authentication: {
            noAuth: 'Authentication failed. Please contact the site administrator.'
        },
        canvas: {
            streamError: 'Error occurred during parsing of data stream.',
            default: 'Error: could not complete operation.',
            emptyCanvas: `Please load both canvases to complete operation.`,
            collinearPts: 'Control points should not be collinear (form a line).',
            missingControlPoints: `Missing control points to complete operation.`,
            maxControlPoints: 'Maximum number of control points selected.',
            mismatchedDims: `Images must be scaled to the same width to complete operation.`
        }
    },
    messages: {
        isLoggedIn: 'User is logged in!',
        isLoggedOut: 'User is logged out!',
        unauthorized: 'Access Denied!'
    },
    views: {
        users: {
            login: {
                label: 'Sign In',
                legend: 'User Authentication',
                submit: 'Sign In',
                method: 'POST',
                render: 'login'
            }
        },
        import: {
            label: 'Import',
            legend: 'Import New',
            submit: 'Import',
            method: 'POST',
            render: 'import',
            singular: false
        },
        upload: {
            label: 'Upload Files',
            legend: 'File Upload',
            submit: 'Upload',
            method: 'POST',
            render: 'upload'
        },
        new: {
            label: 'Add New',
            legend: 'Add',
            submit: 'Add',
            render: 'update'
        },
        edit: {
            label: 'Update',
            legend: 'Edit',
            submit: 'Update',
            render: 'update'
        },
        remove: {
            label: 'Remove',
            legend: 'Delete',
            submit: 'Delete',
            render: 'update'
        },
        show: {
            label: 'Info',
            legend: 'Item',
            render: 'nodes'
        },
        master: {
            label: 'Master',
            legend: 'Master Images',
            submit: 'Upload Mastered Image',
            render: 'master'
        },
        filterNavigation: {
            label: 'Filter Navigation',
            legend: 'Filter',
            submit: 'Filter',
            render: 'form'
        },
        filterBoundaries: {
            label: 'Filter Survey Boundaries',
            legend: 'Filter',
            submit: 'Filter',
            render: 'form'
        },
        filter: {
            label: 'Filter',
            legend: 'Filter',
            submit: 'Filter',
            render: 'filter'
        },
        search: {
            label: 'Search',
            legend: 'Search',
            submit: '',
            render: 'form'
        },
        download: {
            label: 'Download File',
            legend: 'Download',
            submit: 'Download',
            render: 'download'
        },
        extract: {
            label: 'Extract Map Features',
            legend: 'Extract Map Features',
            submit: 'Extract',
            method: 'POST',
            render: 'import'
        },
    },
    captures: {
        types: ['historic_captures', 'modern_captures'],
        sorted: ['historic_visits', 'locations'],
        unsorted: ['projects', 'surveys', 'survey_seasons', 'modern_visits']
    },
    imageTypes: ['historic_images', 'modern_images', 'supplemental_images'],
    excluded: ['historic_images', 'modern_images', 'supplemental_images', 'historic_captures', 'modern_captures'],
    models: {
        users: {
            fieldsets: [
                {
                    legend: 'User Authentication',
                    collapsible: false,
                    email: {
                        label: 'Email',
                        render: 'email',
                        validate: ['isRequired', 'isEmail']
                    },
                    password: {
                        label: 'Password',
                        render: 'password',
                        validate: ['isRequired', 'isPassword'],
                        restrict: ['login', 'register']
                    }
                }
            ]
        },
        map_objects: {
            attributes: {
                order: 30,
                label: "Map Feature Groups",
                singular: "Map Feature Group",
                dependents: [
                    'map_features',
                    'metadata_files'
                ],
                files: [
                    'metadata_files'
                ]
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden',
                    }
                },
                {
                    legend: 'Map Object Details',
                    name: {
                        label: 'Name'
                    },
                    type: {
                        render: 'select',
                        reference: 'map_object_types',
                        label: 'Map Object Type'
                    },
                    description: {
                        label: 'Description'
                    }
                },
                {
                    legend: 'Dependent Nodes',
                    render: 'component',
                    restrict: ['edit'],
                    dependents: {
                        label: 'Edit Dependents Metadata/Files',
                        render: 'dependentsEditor',
                        reference: 'node',
                    }
                }
            ]
        },
        map_features: {
            attributes: {
                order: 30,
                label: "Map Boundaries and Features",
                singular: "Map Boundary/Feature"
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden',
                    },
                    owner_id: {
                        render: 'hidden',
                    }
                },
                {
                    legend: 'Extract Map Features',
                    restrict: ['extract'],
                    users: ['administrator', 'super_administrator'],
                    kmz_file: {
                        label: 'KMZ Metadata File',
                        render: 'file',
                        multiple: false,
                        validate: ['filesSelected']
                    }
                },
                {
                    legend: 'Map Feature Details',
                    restrict: ['show', 'new', 'edit'],
                    name: {
                        label: 'Name'
                    },
                    type: {
                        render: 'select',
                        reference: 'map_feature_types',
                        label: 'Map Feature Type'
                    },
                    description: {
                        label: 'Description'
                    },
                    geometry: {
                        label: 'Geometry (GeoJSON)',
                        render: 'json',
                        validate: ['isJSON']
                    }
                }
            ]
        },
        projects: {
            attributes: {
                order: 1,
                label: "Projects",
                singular: "Project",
                dependents: [
                    'stations',
                    'historic_captures',
                    'modern_captures',
                    'maps'
                ],
                files: false
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden',
                    }
                },
                {
                    legend: 'Project Details',
                    name: {
                        label: 'Name',
                        validate: ['isRequired'],
                    },
                    description: {
                        label: 'Description'
                    }
                },
                {
                    legend: 'Dependent Nodes',
                    render: 'component',
                    restrict: ['edit'],
                    dependents: {
                        label: 'Edit Dependents Metadata/Files',
                        render: 'dependentsEditor',
                        reference: 'node',
                    }
                },
            ]
        },
        surveyors: {
            attributes: {
                order: 2,
                label: "Surveyors",
                singular: "Surveyor",
                dependents: ['surveys'],
                files: false
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Surveyor Details',
                    given_names: {
                        label: 'Given Names'
                    },
                    last_name: {
                        label: 'Last Name',
                        validate: ['isRequired']
                    },
                    short_name: {
                        label: 'Short Name'
                    },
                    affiliation: {
                        label: 'Affiliation'
                    }
                }]
        },
        surveys: {
            attributes: {
                order: 3,
                label: "Surveys",
                singular: "Survey",
                dependents: [
                    'survey_seasons',
                    'historic_captures',
                    'modern_captures',
                    'supplemental_images',
                    'metadata_files'
                ],
                files: [
                    'supplemental_images',
                    'metadata_files'
                ]
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Survey Details',
                    name: {
                        label: 'Survey Name',
                        validate: ['isRequired'],
                        tooltip: 'The survey name is required.'
                    },
                    historical_map_sheet: {
                        label: 'Historical Map Sheet'
                    }
                },
                {
                    legend: 'Attached Metadata and Files',
                    render: 'component',
                    restrict: ['edit'],
                    users: ['editor', 'administrator', 'super_administrator'],
                    attached: {
                        label: 'Edit Dependent Nodes',
                        render: 'dependentsEditor',
                        reference: 'node',
                    },
                },
            ]
        },
        survey_seasons: {
            attributes: {
                order: 4,
                label: "Survey Seasons",
                singular: "Survey Season",
                dependents: [
                    'glass_plate_listings',
                    'maps',
                    'supplemental_images',
                    'metadata_files',
                    'stations',
                    'historic_captures',
                    'modern_captures'
                ],
                files: [
                    'supplemental_images',
                    'metadata_files'
                ]
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden',
                        validate: ['isRequired']
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Attached/Dependent Metadata',
                    render: 'component',
                    restrict: ['edit'],
                    users: ['editor', 'administrator', 'super_administrator'],
                    attached: {
                        label: 'Edit Dependent Items',
                        render: 'dependentsEditor',
                        reference: 'node',
                    },
                },
                {
                    legend: 'Survey Season Details',
                    year: {
                        label: 'Year',
                        render: 'year',
                        validate: ['isRequired']
                    },
                    geographic_coverage: {
                        label: 'Geographic Coverage'
                    },
                    jurisdiction: {
                        label: 'Jurisdiction'
                    },
                    affiliation: {
                        label: 'Affiliation'
                    },
                    archive: {
                        label: 'Archive'
                    },
                    collection: {
                        label: 'Collection'
                    },
                    location: {
                        label: 'Location'
                    },
                    sources: {
                        label: 'Sources'
                    },
                    notes: {
                        render: 'textarea',
                        label: 'Notes'
                    }
                }]
        },
        stations: {
            attributes: {
                order: 5,
                label: "Stations",
                singular: "Station",
                dependents: [
                    'historic_visits',
                    'modern_visits',
                    'modern_captures',
                    'supplemental_images',
                    'metadata_files'
                ],
                files: [
                    'supplemental_images',
                    'metadata_files'
                ]
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    restrict: ['new', 'show', 'edit', 'delete'],
                    legend: 'Station Details',
                    name: {
                        label: 'Station Name',
                        validate: ['isRequired']
                    },
                    nts_sheet: {
                        label: 'NTS Sheet'
                    }
                },
                {
                    restrict: ['new', 'show', 'edit', 'delete'],
                    legend: 'Coordinates',
                    lat: {
                        label: 'Latitude',
                        render: 'coord',
                        validate: ['isLatitude']
                    },
                    lng: {
                        label: 'Longitude',
                        render: 'coord',
                        validate: ['isLongitude']
                    },
                    elev: {
                        label: 'Elevation',
                        render: 'float',
                        suffix: 'm'
                    },
                    azim: {
                        label: 'Azimuth',
                        render: 'float',
                        suffix: '°',
                        validate: ['isAzimuth']
                    }
                },
                {
                    legend: 'Attached/Dependent Metadata',
                    render: 'component',
                    restrict: ['edit'],
                    users: ['editor', 'administrator', 'super_administrator'],
                    attached: {
                        label: 'Edit Dependent Items',
                        render: 'dependentsEditor',
                        reference: 'node',
                    },
                },
                {
                    legend: 'Filter Stations',
                    restrict: ['filterNavigation'],
                    surveyors: {
                        render: 'select',
                        reference: 'surveyors',
                        label: 'Surveyor'
                    },
                    surveys: {
                        render: 'select',
                        reference: 'surveys',
                        label: 'Survey',
                    },
                    survey_seasons: {
                        render: 'select',
                        reference: 'survey_seasons',
                        label: 'Survey Season'
                    },
                    status: {
                        render: 'select',
                        reference: 'statuses',
                        label: 'Station Status'
                    }
                }
            ]
        },
        historic_visits: {
            attributes: {
                order: 6,
                label: "Historic Visits",
                singular: "Historic Visit",
                prefix: "Historic Visit",
                dependents: ['historic_captures']
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Historic Visit: Dependent Nodes',
                    render: 'component',
                    restrict: ['edit'],
                    users: ['editor', 'administrator', 'super_administrator'],
                    dependents: {
                        label: 'Edit Historic Captures',
                        render: 'dependentsEditor',
                        reference: 'node',
                    }
                },
                {
                    legend: 'Visit Details',
                    date: {
                        render: 'date',
                        label: 'Visit Date',
                    },
                    comments: {
                        label: 'Comments',
                    },
                }
            ]
        },
        modern_visits: {
            attributes: {
                order: 7,
                label: "Modern Visits",
                singular: "Modern Visit",
                dependents: [
                    'locations',
                    'participant_groups',
                    'modern_captures',
                    'supplemental_images',
                    'metadata_files'
                ],
                files: [
                    'metadata_files',
                    'supplemental_images'
                ]
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Attached Metadata and Files',
                    render: 'component',
                    restrict: ['edit'],
                    users: ['editor', 'administrator', 'super_administrator'],
                    attached: {
                        label: 'Edit Metadata and Files',
                        render: 'dependentsEditor',
                        reference: 'node',
                    },
                },
                {
                    legend: 'Visit Details',
                    date: {
                        label: 'Visit Date',
                        render: 'date'
                    },
                    start_time: {
                        label: 'Start Time',
                        render: 'time'
                    },
                    finish_time: {
                        label: 'Finish Time',
                        render: 'time'
                    },
                    pilot: {
                        label: 'Pilot'
                    },
                    rw_call_sign: {
                        label: 'RW Call Sign'
                    },
                    visit_narrative: {
                        label: 'Narrative',
                        render: 'textarea'
                    },
                    illustration: {
                        label: 'Illustration'
                    }
                },
                {
                    legend: 'Weather Conditions',
                    weather_narrative: {
                        label: 'Weather Description',
                        render: 'textarea'
                    },
                    weather_ws: {
                        label: 'Wind Speed',
                        render: 'float',
                        suffix: 'km/h'
                    },
                    weather_temp: {
                        label: 'Temperature',
                        render: 'float',
                        min: -273,
                        suffix: '°C'
                    },
                    weather_pressure: {
                        label: 'Barometric Pressure',
                        suffix: 'kPa',
                        render: 'float'
                    },
                    weather_gs: {
                        label: 'Gust Speed',
                        suffix: 'km/h',
                        render: 'float'
                    },
                    weather_rh: {
                        label: 'Relative Humidity',
                        render: 'float',
                        suffix: '%'
                    },
                    weather_wb: {
                        label: 'Wet Bulb',
                        render: 'float',
                        suffix: '°C'
                    }
                }
            ]
        },
        unsorted_captures: {
            attributes: {
                order: 8,
                label: "Unsorted Captures",
                singular: "Unsorted Capture",
                prefix: "Unsorted Capture",
                dependents: ['historic_images', 'modern_images']
            }
        },
        historic_captures: {
            attributes: {
                order: 8,
                label: "Historic Captures",
                singular: "Historic Capture",
                prefix: "Capture",
                dependents: ['historic_images']
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Image Upload',
                    restrict: ['import'],
                    users: ['administrator', 'super_administrator'],
                    historic_images: {
                        label: 'Image Files',
                        render: 'file',
                        multiple: true,
                        validate: ['filesSelected']
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states',
                        validate: ['isRequired']
                    }
                },
                {
                    legend: 'Historic Capture Images',
                    render: 'component',
                    restrict: ['edit'],
                    dependents: {
                        label: 'Edit Capture Images Metadata',
                        render: 'dependentsEditor',
                        reference: 'node',
                    }
                },
                {
                    legend: 'Image Upload',
                    render: 'multiple',
                    restrict: ['new'],
                    users: ['administrator', 'super_administrator'],
                    historic_images: {
                        label: 'Image File',
                        render: 'file',
                        validate: ['filesSelected'],
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states',
                        validate: ['isRequired']
                    }
                },
                {
                    legend: 'Select Modern Repeat Captures',
                    restrict: ['new', 'edit'],
                    users: ['editor', 'administrator', 'super_administrator'],
                    modern_captures: {
                        label: 'Repeated Modern Captures for Comparison',
                        render: 'comparisonEditor',
                        reference: 'node',
                    }
                },
                {
                    legend: 'Digitization Details',
                    restrict: ['show', 'new', 'edit'],
                    fn_photo_reference: {
                        label: 'Field Notes Photo Reference'

                    },
                    digitization_location: {
                        label: 'Digitization Location'
                    },
                    digitization_datetime: {
                        label: 'Digitization Datetime',
                        render: 'datetime',
                    },
                    comments: {
                        label: 'Comments'
                    }
                },
                {
                    legend: 'Camera Details',
                    restrict: ['show', 'new', 'edit'],
                    cameras_id: {
                        label: 'Camera',
                        render: 'select',
                        reference: 'cameras'
                    },
                    lens_id: {
                        label: 'Lens',
                        render: 'select',
                        reference: 'lens'
                    },
                    f_stop: {
                        label: 'F-stop',
                        render: 'float',
                        min: 0,
                        prefix: 'f/'
                    },
                    shutter_speed: {
                        label: 'Shutter Speed',
                        render: 'smallText'
                    },
                    focal_length: {
                        label: 'Focal Length',
                        render: 'float',
                        min: 0,
                        suffix: 'mm'
                    },
                    capture_datetime: {
                        label: 'Capture Datetime',
                        render: 'datetime'
                    }
                },
                {
                    legend: 'Library Archives Canada (LAC) Metadata',
                    restrict: ['show', 'new', 'edit'],
                    lac_ecopy: {
                        label: 'LAC ECopy Number'
                    },
                    lac_wo: {
                        label: 'LAC WO'
                    },
                    lac_collection: {
                        label: 'LAC Collection'
                    },
                    lac_box: {
                        label: 'LAC Box'
                    },
                    lac_catalogue: {
                        label: 'LAC Catalogue'
                    },
                    condition: {
                        label: 'Condition'
                    },
                    plate_id: {
                        label: 'Plate ID'
                    }
                }
            ]
        },
        modern_captures: {
            attributes: {
                order: 9,
                label: "Modern Captures",
                singular: "Modern Capture",
                prefix: "Modern Capture",
                dependents: ['modern_images']
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    }
                },
                {
                    restrict: ['move'],
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Bulk Image Upload',
                    restrict: ['import'],
                    users: ['administrator', 'super_administrator'],
                    modern_images: {
                        label: 'Image Files',
                        render: 'file',
                        multiple: true,
                        validate: ['filesSelected']
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states',
                        validate: ['isRequired']
                    }
                },
                {
                    legend: 'Image Upload',
                    render: 'multiple',
                    restrict: ['new'],
                    users: ['administrator', 'super_administrator'],
                    modern_images: {
                        label: 'Image File',
                        render: 'file',
                        validate: ['filesSelected'],
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states',
                        validate: ['isRequired']
                    }
                },
                {
                    legend: 'Compare Historic Capture',
                    restrict: ['new', 'edit'],
                    users: ['editor', 'administrator', 'super_administrator'],
                    historic_captures: {
                        label: 'Historic Captures for Comparison',
                        render: 'comparisonEditor',
                        reference: 'node',
                    }
                },
                {
                    legend: 'Capture Details',
                    restrict: ['show', 'new', 'edit', 'import'],
                    fn_photo_reference: {
                        label: 'Field Notes Photo Reference'
                    },
                    capture_datetime: {
                        render: 'datetime',
                        label: 'Capture Datetime'
                    },
                    comments: {
                        label: 'Comments'
                    },
                    alternate: {
                        label: 'Alternate',
                        render: 'checkbox'
                    }
                },
                {
                    legend: 'Coordinates',
                    restrict: ['show', 'new', 'edit', 'import'],
                    lat: {
                        label: 'Latitude',
                        render: 'coord',
                        validate: ['isLatitude']
                    },
                    lng: {
                        label: 'Longitude',
                        render: 'coord',
                        validate: ['isLongitude']
                    },
                    elev: {
                        label: 'Elevation',
                        render: 'float',
                        suffix: 'm'
                    },
                    azim: {
                        label: 'Azimuth',
                        render: 'float',
                        suffix: '°',
                        validate: ['isAzimuth']
                    }
                },
                {
                    legend: 'Camera Details',
                    restrict: ['show', 'new', 'edit', 'import'],
                    cameras_id: {
                        render: 'select',
                        reference: 'cameras',
                        label: 'Camera'
                    },
                    lens_id: {
                        render: 'select',
                        reference: 'lens',
                        label: 'Lens'
                    },
                    f_stop: {
                        label: 'F-stop',
                        render: 'float',
                        min: 0,
                        prefix: 'f/'
                    },
                    shutter_speed: {
                        label: 'Shutter Speed',
                        render: 'smallText'
                    },
                    focal_length: {
                        label: 'Focal Length',
                        render: 'float',
                        min: 0,
                        suffix: 'mm'
                    }
                },
                {
                    legend: 'Modern Capture Images',
                    render: 'component',
                    restrict: ['edit'],
                    dependents: {
                        label: 'Edit Capture Images',
                        render: 'dependentsEditor',
                        reference: 'node',
                    }
                }
            ]
        },
        locations: {
            attributes: {
                order: 10,
                label: "Locations",
                prefix: "Location",
                singular: "Location",
                dependents: [
                    'modern_captures',
                    'supplemental_images'
                ],
                files: ['supplemental_images']
            },
            fieldsets: [
                {
                    restrict: ['edit', 'delete'],
                    nodes_id: {
                        render: 'hidden'
                    },
                    owner_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Location Details',
                    location_narrative: {
                        label: 'Narrative'
                    },
                    location_identity: {
                        label: 'Location ID'
                    },
                    legacy_photos_start: {
                        label: 'Photo Start Index',
                        render: 'int',
                        min: 0
                    },
                    legacy_photos_end: {
                        label: 'Photos End Index',
                        render: 'int',
                        min: 0
                    }
                },
                {
                    restrict: ['new', 'show', 'edit', 'delete'],
                    legend: 'Coordinates',
                    lat: {
                        label: 'Latitude',
                        render: 'coord',
                        validate: ['isLatitude']
                    },
                    lng: {
                        label: 'Longitude',
                        render: 'coord',
                        validate: ['isLongitude']
                    },
                    elev: {
                        label: 'Elevation',
                        render: 'float',
                        suffix: 'm'
                    },
                    azim: {
                        label: 'Azimuth',
                        render: 'float',
                        suffix: '°',
                        validate: ['isAzimuth']
                    }
                },
                {
                    legend: 'Attached Metadata and Files',
                    render: 'component',
                    restrict: ['edit'],
                    users: ['editor', 'administrator', 'super_administrator'],
                    attached: {
                        label: 'Edit Dependent Nodes',
                        render: 'dependentsEditor',
                        reference: 'node',
                    },
                },
            ]
        },
        historic_images: {
            attributes: {
                filetype: 'image',
                order: 11,
                label: "Historic Images",
                singular: "Historic Image"
            },
            fieldsets: [
                {
                    restrict: ['edit'],
                    files_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Image Upload',
                    restrict: ['new'],
                    users: ['administrator', 'super_administrator'],
                    historic_images: {
                        label: 'Image File',
                        render: 'file',
                        validate: ['filesSelected']
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states',
                        validate: ['isRequired']
                    }
                },
                {
                    legend: 'Capture Image',
                    restrict: ['edit', 'show', 'upload'],
                    image_state: {
                        label: 'Image State',
                        render: 'select',
                        reference: 'image_states',
                        validate: ['isRequired']
                    }
                },
                {
                    legend: 'Image Details',
                    restrict: ['show'],
                    filename: {
                        render: 'text',
                        label: 'Filename',
                        restrict: ['show']
                    },
                    format: {
                        label: 'Image Format'
                    },
                    file_size: {
                        render: 'filesize',
                        label: 'File size',
                    },
                    x_dim: {
                        render: 'imgsize',
                        label: 'Image Width'
                    },
                    y_dim: {
                        render: 'imgsize',
                        label: 'Image Height'
                    },
                    channels: {
                        label: 'Channels'
                    },
                    density: {
                        label: 'Density'
                    },
                    space: {
                        label: 'Space'
                    },
                    comments: {
                        label: 'Comments'
                    }
                },
                {
                    legend: 'Camera Details',
                    restrict: ['show'],
                    cameras_id: {
                        render: 'select',
                        reference: 'cameras',
                        label: 'Camera'
                    },
                    lens_id: {
                        render: 'select',
                        reference: 'lens',
                        label: 'Lens'
                    },
                    f_stop: {
                        label: 'F-stop',
                        render: 'float',
                        min: 0,
                        prefix: 'f/'
                    },
                    shutter_speed: {
                        label: 'Shutter Speed',
                        render: 'smallText'
                    },
                    focal_length: {
                        label: 'Focal Length',
                        render: 'float',
                        min: 0,
                        suffix: 'mm'
                    }
                },
                {
                    legend: 'Coordinates',
                    restrict: ['show'],
                    lat: {
                        label: 'Latitude',
                        render: 'coord',
                    },
                    lng: {
                        label: 'Longitude',
                        render: 'coord',
                    },
                    elev: {
                        label: 'Elevation',
                        suffix: 'm',
                        render: 'float'
                    },
                    azim: {
                        label: 'Azimuth',
                        render: 'float',
                        suffix: '°'
                    }
                }]
        },
        modern_images: {
            attributes: {
                filetype: 'image',
                order: 12,
                label: "Modern Images",
                singular: "Modern Image"
            },
            fieldsets: [
                {
                    restrict: ['edit'],
                    files_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Image Upload',
                    restrict: ['new'],
                    users: ['administrator', 'super_administrator'],
                    modern_images: {
                        label: 'Image File',
                        render: 'file',
                        validate: ['filesSelected']
                    },
                    image_state: {
                        render: 'select',
                        label: 'Image State',
                        reference: 'image_states',
                        validate: ['isRequired']
                    }
                },
                {
                    restrict: ['master'],
                    users: ['administrator', 'super_administrator'],
                    historic_capture: {
                        render: 'hidden'
                    },
                    modern_capture: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Capture Image',
                    restrict: ['edit', 'show', 'upload'],
                    image_state: {
                        label: 'Image State',
                        render: 'select',
                        reference: 'image_states',
                        validate: ['isRequired']
                    }
                },
                {
                    legend: 'Image Details',
                    restrict: ['show', 'edit'],
                    filename: {
                        render: 'text',
                        label: 'Filename',
                        restrict: ['show']
                    },
                    mimetype: {
                        render: 'text',
                        label: 'Format',
                        restrict: ['show']
                    },
                    file_size: {
                        render: 'filesize',
                        label: 'File size',
                        restrict: ['show']
                    },
                    x_dim: {
                        render: 'imgsize',
                        label: 'Image Width',
                        restrict: ['show']
                    },
                    y_dim: {
                        render: 'imgsize',
                        label: 'Image Height',
                        restrict: ['show']
                    },
                    bit_depth: {
                        label: 'Bit Depth',
                        restrict: ['show']
                    },
                    capture_datetime: {
                        label: 'Capture Datetime',
                        render: 'datetime',
                        restrict: ['show']
                    },
                    comments: {
                        label: 'Comments',
                        render: 'textarea',
                        restrict: ['show', 'edit']
                    }
                },
                {
                    legend: 'Coordinates',
                    restrict: ['show', 'edit'],
                    lat: {
                        label: 'Latitude',
                        render: 'coord',
                        validate: ['isLatitude']
                    },
                    lng: {
                        label: 'Longitude',
                        render: 'coord',
                        validate: ['isLongitude']
                    }
                },
                {
                    legend: 'Camera Details',
                    restrict: ['show', 'edit'],
                    cameras_id: {
                        render: 'select',
                        label: 'Camera',
                        reference: 'cameras'
                    },
                    lens_id: {
                        render: 'select',
                        label: 'Lens',
                        reference: 'lens'
                    },
                    f_stop: {
                        label: 'F-stop',
                        render: 'float',
                        min: 0,
                        prefix: 'f/'
                    },
                    shutter_speed: {
                        label: 'Shutter Speed',
                        render: 'smallText'
                    },
                    focal_length: {
                        label: 'Focal Length',
                        render: 'float',
                        min: 0,
                        suffix: 'mm'
                    },
                    iso: {
                        label: 'ISO',
                        render: 'int'
                    },
                }]
        },
        master_images: {
            attributes: {
                filetype: 'image',
                order: 12,
                label: "Master Images",
                singular: "Master Image"
            },
            fieldsets: [
                {
                    legend: 'Image Metadata',
                    users: ['administrator', 'super_administrator'],
                    capture: {
                        label: 'Capture',
                        render: 'text'
                    },
                    filename: {
                        label: 'Filename',
                        render: 'int'
                    },
                    mime_type: {
                        label: 'Type',
                        render: 'text'
                    },
                    width: {
                        label: 'Width',
                        render: 'int'
                    },
                    height: {
                        label: 'Height',
                        render: 'int'
                    },
                },
            ]
        },
        supplemental_images: {
            attributes: {
                filetype: 'image',
                order: 12,
                label: "Supplemental Images",
                singular: "Supplemental Image"
            },
            fieldsets: [
                {
                    restrict: ['edit'],
                    files_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Image Upload',
                    restrict: ['new'],
                    users: ['administrator', 'super_administrator'],
                    supplemental_images: {
                        label: 'Image File',
                        render: 'file',
                        validate: ['filesSelected']
                    }
                },
                {
                    legend: 'Image Details',
                    restrict: ['new', 'edit'],
                    image_type: {
                        label: 'Image Type',
                        render: 'select',
                        reference: 'image_types',
                        validate: ['isRequired']
                    },
                    capture_datetime: {
                        label: 'Capture Datetime',
                        render: 'datetime'
                    },
                    comments: {
                        label: 'Comments',
                        render: 'textarea'
                    }
                },
                {
                    legend: 'Image Details',
                    restrict: ['show'],
                    filename: {
                        render: 'text',
                        label: 'Filename',
                        restrict: ['show']
                    },
                    image_type: {
                        label: 'Image Type',
                        render: 'select',
                        reference: 'image_types'
                    },
                    mimetype: {
                        render: 'text',
                        label: 'Format',
                        restrict: ['show']
                    },
                    file_size: {
                        render: 'filesize',
                        label: 'File size',
                        restrict: ['show']
                    },
                    x_dim: {
                        render: 'imgsize',
                        label: 'Image Width',
                        restrict: ['show']
                    },
                    y_dim: {
                        render: 'imgsize',
                        label: 'Image Height',
                        restrict: ['show']
                    },
                    bit_depth: {
                        label: 'Bit Depth',
                        restrict: ['show']
                    },
                    capture_datetime: {
                        label: 'Capture Datetime',
                        render: 'datetime',
                        restrict: ['show']
                    },
                    comments: {
                        label: 'Comments',
                        render: 'textarea',
                        restrict: ['show', 'edit']
                    }
                },
                {
                    legend: 'Coordinates',
                    lat: {
                        label: 'Latitude',
                        render: 'coord',
                        validate: ['isLatitude']
                    },
                    lng: {
                        label: 'Longitude',
                        render: 'coord',
                        validate: ['isLongitude']
                    }
                },
                {
                    legend: 'Camera Details',
                    cameras_id: {
                        render: 'select',
                        label: 'Camera',
                        reference: 'cameras'
                    },
                    lens_id: {
                        render: 'select',
                        label: 'Lens',
                        reference: 'lens'
                    },
                    f_stop: {
                        label: 'F-stop',
                        render: 'float',
                        min: 0,
                        prefix: 'f/'
                    },
                    shutter_speed: {
                        label: 'Shutter Speed',
                        render: 'smallText'
                    },
                    focal_length: {
                        label: 'Focal Length',
                        render: 'float',
                        min: 0,
                        suffix: 'mm'
                    },
                    iso: {
                        label: 'ISO',
                        render: 'int'
                    }
                }]
        },
        metadata_files: {
            attributes: {
                order: 13,
                label: "Metadata Files",
                singular: "Metadata File"
            },
            fieldsets: [
                {
                    legend: 'File Upload',
                    restrict: ['new'],
                    users: ['administrator', 'super_administrator'],
                    metadata_files: {
                        label: 'Metadata File (PDF)',
                        render: 'file',
                        validate: ['filesSelected']
                    },
                    type: {
                        label: 'Metadata Type',
                        render: 'select',
                        reference: 'metadata_file_types',
                        validate: ['isRequired']
                    },
                },
                {
                    legend: 'Edit Metadata Type',
                    restrict: ['edit'],
                    files_id: {
                        render: 'hidden'
                    },
                    type: {
                        label: 'Metadata Type',
                        render: 'select',
                        reference: 'metadata_file_types',
                        validate: ['isRequired']
                    },
                },
                {
                    legend: 'File Details',
                    restrict: ['show'],
                    filename: {
                        label: 'Filename',
                        render: 'int'
                    },
                    type: {
                        label: 'Metadata Type',
                        reference: 'metadata_file_types'
                    },
                    mimetype: {
                        label: 'Format',
                        render: 'text'
                    },
                    file_size: {
                        render: 'filesize',
                        label: 'File size',
                    },
                    created_at: {
                        label: 'Created',
                        render: 'datetime',
                    },
                    updated_at: {
                        label: 'Last Updated',
                        render: 'datetime',
                    },
                }]
        },
        showcase_images: {
            attributes: {
                filetype: 'image',
                order: 12,
                label: "Showcase Images",
                singular: "Showcase Image"
            },
            fieldsets: [
                {
                    restrict: ['edit'],
                    files_id: {
                        render: 'hidden'
                    }
                },
                {
                    legend: 'Image Upload',
                    restrict: ['new'],
                    users: ['administrator', 'super_administrator'],
                    supplemental_images: {
                        label: 'Image File',
                        render: 'file',
                        validate: ['filesSelected']
                    }
                },
                {
                    legend: 'Image Details',
                    restrict: ['new', 'edit'],
                    capture_datetime: {
                        label: 'Capture Datetime',
                        render: 'datetime'
                    },
                    comments: {
                        label: 'Caption',
                        render: 'textarea'
                    }
                },
                {
                    legend: 'Image Details',
                    restrict: ['show'],
                    filename: {
                        render: 'text',
                        label: 'Filename',
                        restrict: ['show']
                    },
                    image_type: {
                        label: 'Image Type',
                        render: 'select',
                        reference: 'image_types'
                    },
                    mimetype: {
                        render: 'text',
                        label: 'Format',
                        restrict: ['show']
                    },
                    file_size: {
                        render: 'filesize',
                        label: 'File size',
                        restrict: ['show']
                    },
                    x_dim: {
                        render: 'imgsize',
                        label: 'Image Width',
                        restrict: ['show']
                    },
                    y_dim: {
                        render: 'imgsize',
                        label: 'Image Height',
                        restrict: ['show']
                    },
                    bit_depth: {
                        label: 'Bit Depth',
                        restrict: ['show']
                    },
                    capture_datetime: {
                        label: 'Capture Datetime',
                        render: 'datetime',
                        restrict: ['show']
                    },
                    comments: {
                        label: 'Caption',
                        render: 'textarea',
                        restrict: ['show', 'edit']
                    }
                },
                {
                    legend: 'Coordinates',
                    lat: {
                        label: 'Latitude',
                        render: 'coord',
                        validate: ['isLatitude']
                    },
                    lng: {
                        label: 'Longitude',
                        render: 'coord',
                        validate: ['isLongitude']
                    }
                },
                {
                    legend: 'Camera Details',
                    cameras_id: {
                        render: 'select',
                        label: 'Camera',
                        reference: 'cameras'
                    },
                    lens_id: {
                        render: 'select',
                        label: 'Lens',
                        reference: 'lens'
                    },
                    f_stop: {
                        label: 'F-stop',
                        render: 'float',
                        min: 0,
                        prefix: 'f/'
                    },
                    shutter_speed: {
                        label: 'Shutter Speed',
                        render: 'smallText'
                    },
                    focal_length: {
                        label: 'Focal Length',
                        render: 'float',
                        min: 0,
                        suffix: 'mm'
                    },
                    iso: {
                        label: 'ISO',
                        render: 'int'
                    }
                }]
        },
        statuses: {
            attributes: {
                label: 'Stations Statuses',
                singular: 'Station Status',
            },
            fieldsets: [
                {
                    name: {
                        label: 'Status Name',
                        validate: []
                    },
                    label: {
                        label: 'Station Status Label'
                    }
                }]
        },
        image_states: {
            attributes: {
                label: 'Image States',
                singular: 'Image State',
            },
            fieldsets: [
                {
                    name: {
                        label: 'Image Name',
                        validate: ['isAlphanumeric']
                    },
                    label: {
                        label: 'Image State'
                    }
                }]
        },
        cameras: {
            attributes: {
                label: 'Camera Types',
                singular: 'Camera Type',
            },
            fieldsets: [
                {
                    legend: "Camera",
                    users: ['administrator', 'super_administrator'],
                    make: {
                        label: 'Make',
                        validate: ['isRequired']
                    },
                    model: {
                        label: 'Model',
                        validate: ['isRequired']
                    },
                    unit: {
                        label: 'Unit'
                    },
                    format: {
                        label: 'Format'
                    },
                }]
        },
        lens: {
            attributes: {
                label: 'Lens Types',
                singular: 'Lens Type',
            },
            fieldsets: [
                {
                    legend: "Lens",
                    users: ['administrator', 'super_administrator'],
                    brand: {
                        label: 'Brand',
                        validate: ['isRequired']
                    },
                    focal_length: {
                        label: 'Focal Length',
                        render: 'float'
                    },
                    max_aperture: {
                        label: 'Max Aperture',
                        render: 'float'
                    }
                }]
        },
        glass_plate_listings: {
            attributes: {
                order: 12,
                label: 'Glass Plate Listings',
                singular: 'Glass Plate Listing',
            },
            fieldsets: [
                {
                    legend: 'Glass Plate Listing Details',
                    container: {
                        label: 'Container'
                    },
                    plates: {
                        label: 'Plates'
                    },
                    notes: {
                        label: 'Notes'
                    }
                }]
        },
        maps: {
            attributes: {
                order: 12,
                label: 'Map Boundaries and Features',
                singular: 'Map Boundary/Feature',
            },
            fieldsets: [
                {
                    legend: 'Map Details',
                    nts_map: {
                        label: 'Label'
                    },
                    historic_map: {
                        label: 'Historic Reference'
                    },
                    links: {
                        label: 'Additional Information'
                    },
                    map_features_id: {
                        render: 'mapFeature',
                        label: 'Map Features'
                    }
                }]
        },
        comparisons: {
            attributes: {
                order: 12,
                label: 'Comparisons',
                singular: 'Comparison',
            },
            fieldsets: [
                {
                    legend: 'Capture Images',
                    historic_capture: {
                        label: 'Historic Capture',
                        validate: ['isRequired']
                    },
                    modern_capture: {
                        label: 'Modern Capture',
                        validate: ['isRequired']
                    },
                }]
        },
        image_types: {
            attributes: {
                label: 'Image Types',
                singular: 'Image Type'
            },
            fieldsets: [
                {
                    legend: 'Image Type Settings',
                    users: ['administrator', 'super_administrator'],
                    name: {
                        label: 'Name',
                        validate: ['isRequired']
                    },
                    label: {
                        label: 'Label'
                    },
                }]
        },
        metadata_file_types: {
            attributes: {
                label: 'Metadata File Types',
                singular: 'Metadata File Type'
            },
            fieldsets: [
                {
                    legend: 'Metadata File Type Settings',
                    users: ['administrator', 'super_administrator'],
                    name: {
                        label: 'Name',
                        validate: ['isRequired']
                    },
                    label: {
                        label: 'Label'
                    },
                }]
        },
        map_object_types: {
            attributes: {
                label: 'Map Object Types',
                singular: 'Map Object Type'
            },
            fieldsets: [
                {
                    legend: 'Map Object Type Settings',
                    users: ['administrator', 'super_administrator'],
                    name: {
                        label: 'Name',
                        validate: ['isRequired']
                    },
                    label: {
                        label: 'Label'
                    },
                }]
        },
        map_feature_types: {
            attributes: {
                label: 'Map Feature Types',
                singular: 'Map Feature Type'
            },
            fieldsets: [
                {
                    legend: 'Map Feature Type Settings',
                    users: ['administrator', 'super_administrator'],
                    name: {
                        label: 'Name',
                        validate: ['isRequired']
                    },
                    label: {
                        label: 'Label'
                    },
                }]
        },
        participant_group_types: {
            attributes: {
                label: 'Group Types',
                singular: 'Group Type'
            },
            fieldsets: [
                {
                    legend: 'Group Type Settings',
                    users: ['administrator', 'super_administrator'],
                    name: {
                        label: 'Name',
                        validate: ['isRequired']
                    },
                    label: {
                        label: 'Label'
                    },
                }]
        },
        participant_groups: {
            attributes: {
                label: 'Visit Participants',
                singular: 'Participant Group',
                dependents: [
                    'participants',
                ],
            },
            fieldsets: [
                {
                    legend: 'Participant Groups',
                    restrict: ['show', 'new', 'edit'],
                    hiking_party: {
                        label: 'Hiking Groups',
                        render: 'multiselect',
                        reference: 'participants'
                    },
                    field_notes_authors: {
                        label: 'Field Notes Authors',
                        render: 'multiselect',
                        reference: 'participants'
                    },
                    photographers: {
                        label: 'Photographers',
                        render: 'multiselect',
                        reference: 'participants'
                    }
                }]
        },
        participants: {
            attributes: {
                order: 12,
                label: 'Participants',
                singular: 'Participant',
            },
            fieldsets: [
                {
                    legend: 'Participants',
                    restrict: ['list'],
                    full_name: {
                        label: 'Name'
                    }
                },
                {
                    legend: 'Participant Details',
                    restrict: ['show', 'new', 'edit'],
                    last_name: {
                        label: 'Last Name',
                        validate: ['isRequired']
                    },
                    given_names: {
                        label: 'Given Names',
                        validate: ['isRequired']
                    }
                }
            ]
        },
        files: {
            attributes: {
                label: "Files",
                singular: "File"
            }
        },
        jobs: {
            attributes: {
                order: 20,
                label: 'Jobs',
                singular: 'Job',
            },
            fieldsets: [
                {
                    legend: 'Job Details',
                    job_id: {
                        label: 'Job ID'
                    },
                    process_type: { 
                        label: 'Process Type',
                    },
                    status: {
                        label: 'Status'
                    },
                    timestamp: {
                        label: 'Timestamp',
                        render: 'datetime'
                    },
                    processed_on: {
                        label: 'Processed On',
                        render: 'datetime'
                    },
                    finished_on: {
                        label: 'Finished On',
                        render: 'datetime'
                    },
                    error: {
                        label: 'Error Stack',
                        render: 'json'
                    }
                },
                {
                    legend: 'File Details',
                    id: {
                        label: 'File ID'
                    },
                    file_type: {
                        label: 'File Type'
                    }, 
                    mimetype: {
                        label: 'MIME Type'
                    }, 
                    filename: {
                        label: 'Original Filename'
                    }, 
                    file_size: {
                        label: 'File Size',
                        render: 'filesize'
                    },
                    filename_tmp: {
                        label: 'Temporary File Path'
                    },
                    fs_path: {
                        label: 'File System Path'
                    },
                    encoding: {
                        label: 'Encoding'
                    },
                    secure_token: {
                        label: 'Secure Token'
                    }
                },
                {
                    legend: 'Image Metadata',
                    image_state: {
                        label: 'Image State'
                    }
                },
                {
                    legend: 'Owner Metadata',
                    owner_id: {
                        label: 'ID'
                    },
                    owner_type: {
                        label: 'Model'
                    },
                    owner_fs_path: {
                        label: 'File System Path'
                    }
                },
                {
                    legend: 'Container Metadata',
                    container_id: {
                        label: 'ID'
                    },
                    container_type: {
                        label: 'Model'
                    },
                    container_fs_path: {
                        label: 'File System Path'
                    }
                },
                {
                    legend: 'Versions',
                    version_raw_path: {
                        label: 'Raw Path'
                    },
                    version_thumb_path: {
                        label: 'Thumb Path'
                    },
                    version_medium_path: {
                        label: 'Medium Path'
                    },
                    version_full_path: {
                        label: 'Full Path'
                    }
                }
                
            ]
        },
    }
}
