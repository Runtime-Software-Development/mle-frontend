/*!
 * MLE.Client.Content.Help.Map
 * File: map.help.js
 * Copyright(c) 2024 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Help pages for the Map Navigator component.
 *
 * ---------
 * Revisions
 * - 11-02-2024   Updated instructions for map navigation usage and features.
 */

import React from 'react';
import Icon from '../common/icon';
import Button from "../common/button";

/**
 * Alignment Tool tooltip selector
 *
 * @public
 */

export const getTooltip = (key) => {
    return tooltips.hasOwnProperty(key) ? tooltips[key] : null;
}

/**
 * Alignment Tool instructions
 *
 * @public
 */

const tooltips = {
    selectMapFeatures: <div>
        <p>To load an image from the MLP Library to the Alignment Tool:</p>
        <ol className={'list'}>
            <li>Locate the capture image in the navigator tree</li>
            <li>Click the <Icon type={'iat'}/> icon to open the Alignment loader dialog</li>
            <li>Select which Alignment panel you want to load the image</li>
            <li>Select the image version you want to load</li>
            <li>Click the green 'Load Image in Alignment' button</li>
        </ol>
    </div>,
    viewStationMarkers: <div>
        <div>To load an image from a local directory to the Alignment Tool:</div>
        <ol className={'list'}>
            <li>Click the <Icon type={'load'} /> open file button in the panel controls, or
                click 'Click to load' button on the centre of the panel.
            </li>
            <li>Select "Open Local Image File" or drag and drop a file into the import box and click
                "Open Image".
            </li>
        </ol>
    </div>,
    clusterStationMarkers: <div>
        <p>To upload an image to the MLP Library from the Alignment Tool:</p>
        <ol className={'list'}>
            <li>Locate the capture image in the navigator tree</li>
            <li>Click the <Icon type={'iat'}/> icon to open the Alignment Loader tool</li>
            <li>Select which Alignment panel you want to load the image</li>
            <li>Select the image format for the uploaded image</li>
            <li>Select the image version you want to upload</li>
            <li>Click the green 'Upload Image to MLP Library' button</li>
        </ol>
    </div>,
    cropImage: <div>
        <p>To crop an image to a smaller region:</p>
        <ol className={'list'}>
            <li>Select 'Crop' mode. This displays the crop tool below panels with
                loaded images.</li>
            <li>Click and drag on the image to outline the region of interest. The (X, Y) offset and (W, H) dimensions of the
                selected area are shown in the crop tool. Note that these values are scaled by the rendered image scale.
            </li>
            <li>Adjust the dimensions and position of the selected area from the crop panel or by
                dragging the selection box to a new location in the region. Using the 'Match' function you can also match
                the selected area to match the dimensions of the opposite panel image (if loaded). The selected area
                can be cleared using the <b>erase</b> control button, or by resetting, resizing or changing
                the view scale of the image.
            </li>
            <li>
                To apply the crop, click the green <Icon type={'crop'} /> <b>Crop</b> button in the lower crop panel.
            </li>
        </ol></div>,
    resizeImage: <div>
        <p>To resize an image:</p>
        <ol className={'list'}>
            <li>Click the 'resize' button above the image to open the Resizer tool</li>
            <li>In the Resizer tool, update the dimensions of the image (or canvas). You can match image width or height
                to the opposite panel image dimensions.
            </li>
            <li>Alternatively, you can scale the image by a factor. The aspect ratio of the image is maintained by default.
            </li>
            <li>
                Click the 'Update' button to resize the image. Note that it is necessary to also save the image state to
                update the source image.
            </li>
        </ol>
    </div>,
    alignImages: <div>
        <p>To align and master two images in the Alignment Tool:</p>
        <ol className={'list'}>
            <li>Load images into the left and right panels</li>
            <li>Correct differences in image size by resizing an image such that the largest height/width
                matches that of the opposite image. Use the Resizer tool 'Match' function to match the height or width of
                the corresponding image.</li>
            <li>Click the <Icon type={'crosshairs'} /> <b>Align</b> button from the centre menu OR hit
                the <code>shift</code> key to switch to control point selection.
                The mouse cursor will appear as a crosshair. Click on a visual feature in the image to select each point.
                Four corresponding control points selected from each image are required for alignment.
            </li>
            <li>Identify four corresponding features in the image. Use these guidelines for selection: (1) The control
                points should be pixels that you can identify in both images that haven’t varied over time. (2) The
                control points need to be spread in a box shape around the image; (3) Select points that reduce
                the collinearity coefficient as close to zero as possible. (4) To select more precise control points,
                use pan and zoom into the region of interest, or use the image magnifier by holding down the <code>ctrl</code> key .
            </li>
            <li>Selected control points will appear on the image as cross-shaped markers numbered in the order they were created.
                The coordinates of control points are shown in the Align tool below the canvas. Click
                "Overlay" to view both sets of control points on the same image.</li>
            <li>You can adjust the coordinates or delete control point by clicking the marker icon in the Control
                Points tool.</li>
            <li>Once four control point pairs have been selected, from the panel of the 'target' image to be transformed,
                click the green "Align" button on the Align tool. The image will be transformed
                using perspective transformation
                (See <a target={'_blank'} rel={"noreferrer"} href={'https://docs.opencv.org/4.x/da/d54/group__imgproc__transform.html'}>OpenCV documentation</a>).
            </li>
            <li>To validate the alignment, click the <Icon type={'images'} /> <b>Compare</b> button in the centre menu to
                load the images into the <b>Compare Tool</b>. The images will appear superimposed. Use the opacity slider to compare
                alignment of the selected features. If the two images are of different shapes, you can crop both images to the
                same size in the Compare Tool (follow the same instructions as for panel cropping). Once a crop has been applied,
                click "Save" to replace the panel images with the cropped versions.
                .</li>
        </ol>
    </div>
}

/**
 * Map Navigation Tool help pages.
 *
 * @public
 */

const mapHelp = (gotoPage) => {

    /**
     * Map Navigation Tool "Getting Started" help page.
     *
     * @public
     */

    const gettingStarted = <>
        <h4>Map Navigator Tool: Getting Started</h4>
        <p>
            Use the Map Navigator Tool to view the geographical locations of surveys and stations in the Mountain Legacy
            collection.
        </p>
        <ol className={'list'}>
            <li><b>Basic Features:</b> Panning, zooming, and filtering of stations and other map features.</li>
            <li><b>View Map Features:</b> View mapsheets and other markers and boundaries using the "Features" tool.</li>
            <li><b>Metadata:</b> View metadata associated with each map feature.</li>
        </ol>


    </>;


    /**
     * Map controls help page.
     *
     * @public
     */

    const mapControls = <>
        <h4>Map Controls</h4>
        <p>Map controls allow you to move around the map and filter features and information.</p>
        <p>Multiple Stations are clustered in markers that show the cluster size.</p>
        <p>Click on the marker to view the list of Stations in the cluster. Double click on the
            marker to also zoom and center the map on the cluster.</p>
        <p>Pan by dragging the map; zoom by double clicking the map area, or use the zoom
            controls at top left. You can also view different layers by clicking the layers icon at top right.</p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'add'} /></th>
                <th>Zoom In</th>
                <td>
                    <p>Zoom into the map. </p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'minus'} /></th>
                <th>Zoom Out</th>
                <td>
                    <p>Zoom out of the map.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'move'} /></th>
                <th>Pan</th>
                <td>
                    <p>Click and drag the map to pan to a different view.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'overlay'} /></th>
                <th>Layers</th>
                <td>
                    <p>Select the map base layer (for example, satellite imagery or street map)</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'stations'} /></th>
                <th>View Stations</th>
                <td>
                    <p>Toggle view of station markers on the map.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'clustered'} /></th>
                <th>Cluster Stations</th>
                <td>
                    <p>Toggle clustered or individuated view of station markers.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'map_features'} /></th>
                <th>Features</th>
                <td>
                    <p>Opens a dialog to select map features to view on the map.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>

    /**
     * Map features help page.
     *
     * @public
     */

    const mapFeatures = <>
        <h4>Map Features</h4>
        <p>Map features are artifacts such as location markers or map boundaries that can be shown on the map.</p>
        <p>You can select specific map features from the 'Features' dialog opened from the map controls. Map features
        are also listed in the <Button icon={'help'} label={'Tree Navigator'} onClick={() => {gotoPage(0, 3)}} /> grouped
          under  'Map Feature Groups'. </p>
        <h5>Map Feature Types</h5>
        <table className={'help'}>
            <tbody>
            <tr>
                <th>NTS Map sheets</th>
                <td>
                    <p>National Topographic System (NTS) map sheets refer to indexed map areas covering locations in Canada.
                        Map sheets are identified by a combination of numbers and letters, from A through P (e.g. 13C).
                        They are available in two standard scales: 1:50 000 and 1:250 000. The 1:250 000 blocks are
                        divided into 16 segments (1 to 16), forming blocks used for 1:50 000 scale mapping. </p>
                </td>
            </tr>
            <tr>
                <th>Boundaries</th>
                <td>
                    <p>Boundaries are regions that correspond to MLP historic metadata such as survey or park boundaries.</p>
                </td>
            </tr>
            </tbody>
        </table>
        <h5>Displaying Map Feature</h5>
        <p>To view map features on the map navigator tool, such as NTS mapsheets, open the map display dialog by clicking
            the <Icon type={'map_features'} /> Features button. Here you can select to display all or some of the available map features.
            Use the <Icon type={'filter'} /> filter inputs at the top of the dialog to filter by name or by map feature group. Click the submit button
            at the bottom.</p>
    </>


    return [
        {
            label: 'Getting Started',
            data: gettingStarted,
        },
        {
            label: 'Map Controls',
            data: mapControls,
        },
        {
            label: 'Map Features',
            data: mapFeatures,
        }
    ];
}

export default mapHelp;

