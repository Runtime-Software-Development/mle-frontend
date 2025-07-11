/*!
 * MLE.Client.Components.Selectors.Nodes
 * File: node.selector.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import NodesView from "../views/nodes.view";
import CaptureView from '../views/capture.view';
import Loading from '../common/loading';
import FileSelector from "./file.selector";

/**
 * Data view (node data) component.
 *
 * @param {String} model
 * @param {Object} data
 * @public
 */

const NodeSelector = ({ model, data = {} }) => {

    // view components indexed by model type
    const nodeViews = {
        historic_captures: () => <CaptureView fileType={'historic_images'} model={'historic_captures'} data={data}/>,
        modern_captures: () => <CaptureView fileType={'modern_images'} model={'modern_captures'} data={data}/>,
        historic_images: () => <FileSelector data={data} scale={'medium'} />,
        modern_images: () => <FileSelector data={data} scale={'medium'} />,
        supplemental_images: () => <FileSelector data={data} scale={'medium'} />,
        default: () => <NodesView model={model} data={data}/>,
    };

    return <>
        {
            model && data ?
                <>
                    {
                        nodeViews.hasOwnProperty(model)
                            ? nodeViews[model]()
                            : nodeViews.default()
                    }
                </>
                : <Loading />
        }
    </>;
};

export default NodeSelector;
