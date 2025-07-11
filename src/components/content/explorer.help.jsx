/*!
 * MLE.Client.Content.Help.Explorer
 * File: explorer.help.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Help pages for Explorer.
 *
 * ---------
 * Revisions
 * - 10-15-2023   Update download completion process.
 */

import React from 'react';
import Image from '../common/image';
import Icon from '../common/icon';
import Button from '../common/button';
import captureModel from '../img/capture_image_composition.jpg';
import dataModel from '../img/mlp_data_model.jpg';

/**
 * Index of general help content
 */

const explorerHelp = (gotoPage) => {

    /**
     * Explorer "Getting Started" help page.
     *
     * @public
     */

    const explorerHelp = <>
        <h4>Explorer: Getting Started</h4>
        <p>
            The Mountain Legacy Project has the world's most extensive compilation of meticulously captured,
            high-resolution historic mountain photographs, totaling over 120,000 images.
            Additionally, the project possesses a rapidly expanding assortment of repeat images,
            consisting of over 8,000 pairs of photographs.</p>
        <p>To explore this remarkable collection, the
            Project offers a user-friendly web-based tool known as the "Explorer."
            This online platform allows visitors to navigate, search, and filter the vast array of
            collection items based on surveyor metadata or the geographical location of survey Stations.
        </p>

        <h5>What is Repeat Photography?</h5>
        <p>
            It’s as simple as it sounds. You start with one photo, which was taken at a specific location in a
            specific direction (azimuth), at a specific time. You repeat this photo when you find that same location,
            point the camera in the same direction, and press the shutter release of your camera. The big difference
            between the two photos is temporal. Repeat photographs leverage the systematic nature of the original work,
            allowing researchers to re-photograph the same continuous coverage of the landscape captured by the historic images.
            Taken together, the historic photo and the modern repeat form an image pair. Through careful
            interpretation and analysis, MLP image pairs can be used to explore the dynamics and interplay of
            ecological, climate, and human-induced changes in the landscape. Digital assets include multiple
            versions of historical digitized images (e.g., unprocessed scan; cropped master), repeat images
            (RAW, TIFF and various field-useable images), location images, EXIF camera data, survey and MLP
            field notes and maps.
        </p>
        <h5>About this Guide</h5>
        <p>
            This guide covers usage of features available in both the Explorer, and the Alignment Tool as well as documentation for the MLE Editor management tool. Click on the
            tabs at the top to switch between tools, and the tabs to the left for tool topics.
        </p>
    </>;

    /**
     * Explorer "Viewer" help page.
     */

    const viewerExplorerHelp = <>
        <h4>Exploring the View</h4>

        <h5>Using the Viewer</h5>

        <p>Use the right-side viewer panel to explore the MLP collection images and metadata in detail.
            Search and filter results are also loaded in the viewer.</p>
        <p>The viewer is where <Button icon={'help'} label={'Capture Images'} onClick={() => {gotoPage(0, 2)}} />
            and <Button icon={'help'} label={'Metadata'} onClick={() => {gotoPage(0, 1)}} /> are
            loaded for an indepth look at things. For example, navigate to
            surveyor <a href={"/surveyors/show/5"} target={'_blank'} rel={"noreferrer"}>Morrison Parsons Bridgland</a> to see
            an extensive list of surveys undertaken in the last century. Each survey in the list can be expanded to
            show metadata for that item, as well as any attached dependent items -- in this case, survey seasons.
            You can also click on the item label to go to open the page for that item.</p>

        <h5>Viewer Tabs</h5>
        <p>At the top of the page you will find a number of tabs for any given data item in the model.</p>
        <table className={'help'}>
            <tbody>
            <tr>
                <th>Item Details</th>
                <td>
                    <p>View the core metadata for the item on the current page.</p>
                </td>
            </tr>
            <tr>
                <th>Comparisons</th>
                <td>
                    <p>View comparisons registered historic and modern image pairs.</p>
                </td>
            </tr>
            <tr>
                <th>Metadata</th>
                <td>
                    <p>View attached metadata: e.g. visit participants, glass plate slides, or historic map metadata.</p>
                </td>
            </tr>
            <tr>
                <th>Files</th>
                <td>
                    <p>View attached metadata files: e.g. supplementary images or field note scans.</p>
                </td>
            </tr>
            <tr>
                <th>Captures</th>
                <td>
                    <p>View the attached historic or modern repeat captures for a station. Historic Captures are
                        sorted if attached to Historic Visits; Modern Captures are sorted if attached to locations.
                        Navigate to <Button icon={'help'} label={'Captures'} onClick={() => {gotoPage(0, 2)}} /> for details.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>

    /**
     * Explorer "Model" help page.
     *
     * @public
     */

    const modelExplorerHelp = <>

        <h4>How Explorer is Organized</h4>

        <h5>MLP Data Model</h5>

        <p>A data model for metadata provides a conceptual representation of the structure, relationships,
            and attributes of metadata within a given context or domain. It defines how
            metadata is organized, stored, and managed.</p>

        <p>
            To organize the MLP collection with its thousands of historic and repeat images, as well as its extensive
            database of metadata, a data model has been developed that organizes images by surveyors, surveys,
            survey seasons, stations, visits, and locations. As well, a alternative schema grouped around 'Projects' is
            provided for captures taken by MLP field researchers that do not neatly fit into the surveyor model. </p>
        <p>Each data item in this model is referred to as a <b>node</b> where each node represents a data object of
            core metadata that has both attributes and relationships with other nodes. The relationships are also nested,
            and nodes in the data model frequently contain other nodes. Surveyors have multiple Surveys, Surveys have multiple
            Survey Seasons, Survey Seasons Station each contain an Historic Visit and multiple Modern Visits, and so on.
            This nested hierarchical model is illustrated in <b>Figure 1</b>. A full list of nodes is shown below.
        </p>

        <Image
            url={dataModel}
            caption={`Figure 1. Illustration of MLP data model. Example nodes are shown in the tree, while hierarchy 
            levels are defined to the left.`}
        />

        <h5>Model Elements or Nodes</h5>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'projects'} /></th>
                <th>Projects</th>
                <td>
                    <p>
                        A project is a container for Stations that do not fit into the surveyor model listed below.
                        The <a href={'https://explore.mountainlegacy.ca/projects/show/1'} target={'_blank'} rel={"noreferrer"}>Alberta
                            Fire Lookout Towers</a> project, for example, is organized by lookout tower, rather than
                        survey, where each tower listing contain a set of historic photographs that have been repeated.
                    </p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'surveyors'} /></th>
                <th>Surveyors</th>
                <td>
                    <p>The principal surveyor of a historic survey.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'surveys'} /></th>
                <th>Surveys</th>
                <td>
                    <p>A specific survey completed by a surveyor. A survey covers a large geographical region, and
                        may span several years. Surveys by different surveyors may overlap in the regions they covered.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'survey_seasons'} /></th>
                <th>Survey Seasons</th>
                <td>
                    <p>A Survey Season includes all the Stations completed in a certain year for a specific survey.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'stations'} /></th>
                <th>Stations</th>
                <td>
                    <p>The concept of a station has its roots in the historic surveys. A surveyor would identify a high
                        point in the
                        landscape where photographs were required to be taken. Upon arrival to that location, several
                        photographs
                        would be taken, usually in as many directions as possible. In many cases, the camera
                        would have to be
                        moved around to find the best vantage point for a particular cardinal direction. Thus,
                        there were many 'sub locations' within the general location of the Station. A Station is
                        therefore loosely defined by a geographic location where the distance between
                        sub locations is within a reasonable walking distance. This loose distinction
                        between Station and location has occasionally differed between different surveyors
                        (MLP always groups the images into Stations defined by the Surveyor, if known).</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'historic_visits'} /></th>
                <th>Historic Visits</th>
                <td>
                    <p>A Historic Visit refers to the first visit to a Station by a particular surveyor. It can be
                        thought of as a container for Historic Captures. A Station can have only one Historic Visit.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'modern_visits'} /></th>
                <th>Modern Visits</th>
                <td>
                    <p>A Modern Visit refers to a visit to the Station with the specific purpose of repeating the
                        Historic Captures from the Historic Visit. A visit is uniquely identified by the visit date.
                        Stations may have multiple visits, where each visit may have associated
                        field note data, Modern Captures, locations, and location images.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'locations'} /></th>
                <th>Locations</th>
                <td>
                    <p>Though a Station is a somewhat geographical coordinate, a 'Location' is a clearly defined
                        location proximate to its Station location, and a specific place where a modern
                        capture was taken. </p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'historic_captures'} /></th>
                <th>Historic Captures</th>
                <td>Historic Captures include multiple historic survey images and are typically added under Historic Visits.</td>
            </tr>
            <tr>
                <th><Icon type={'modern_captures'} /></th>
                <th>Modern Captures</th>
                <td>Modern Captures include multiple modern repeat images and are typically added under Modern Visits > Locations.</td>
            </tr>
            </tbody>
        </table>

        <h5>Attached Metadata</h5>

        <p>Other metadata can be attached to specific model elements.</p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'participant_groups'} /></th>
                <th>Participants</th>
                <td>
                    <p>Participants in visiting groups can be attached to Modern Visits. There are three types of
                        participant groups:</p>
                    <ol className={'list'}>
                        <li>Hiking Parties</li>
                        <li>Field Note Authors</li>
                        <li>Photographers</li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'glass_plate_listings'} /></th>
                <th>Glass Plate Listings</th>
                <td>
                    <p>Identification for the original glass plate negatives can be attached to survey seasons.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'maps'} /></th>
                <th>Maps</th>
                <td>
                    <p>Historic map metadata can be attached to survey seasons.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'historic_captures'} /></th>
                <th>Cameras</th>
                <td>
                    <p>Camera details can be attached to historic and Modern Captures.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'historic_captures'} /></th>
                <th>Lenses</th>
                <td>
                    <p>Lens details can be attached to historic and Modern Captures.</p>
                </td>
            </tr>
            </tbody>
        </table>

        <h5>Attached Files</h5>

        <p>In addition to capture images, there are other kinds of files available in the collection.</p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'images'} /></th>
                <th>Supplementary Images</th>
                <td>
                    <p>As part of a visit, location images are used to create a visual record of where the captures were taken. A
                        location image object is associated with an image file. It differs from a capture image in that it does not
                        contain an image state.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'images'} /></th>
                <th>Scenic Images</th>
                <td>
                    <p>A scenic image is an image that was taken during a repeat field season, but not necessarily associated with
                        repeat photography or the visit records. Currently, the inclusion of scenic images at the user interface
                        level is not supported (though it is at the database layer).</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'file'} /></th>
                <th>Field Note Files</th>
                <td>
                    <p>Field notes are often recorded at each visit in a field note book or field note form, then digitized using a
                        scanner. While these field notes will be transcribed and stored in the database via the visit object, the
                        scanned copies are kept for historical reference. Field note files are associated with Modern Visits.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>;

    /**
     * Capture image help content.
     */

    const captureExplorerHelp = <>
        <h4>What is a Capture?</h4>

        <h5>Historic and Modern Captures</h5>
        <p>
            The core artifact of the MLP collection is the capture, which corresponds to a landscape view
            that is unique in location, azimuth, date, and time. For example, given a tripod setup, with the
            camera pointed in a specific direction, suppose photos are taken at f/16, 1/50 sec, and then another
            with a different exposure setting. Though we might consider these photos as sharing the same view, they form
            different captures because they were taken at different times.
        </p>
        <p>The collection has two types of captures:</p>
        <ol>
            <li><b>Historic Capture</b> A Historic Capture may be associated with information related to
                where its glass plate negative is located.
            </li>
            <li><b>Modern (Repeat) Capture</b> The exposure settings of a capture are generally known.</li>
        </ol>

        <h5>Capture Images</h5>
        <p>
            A capture is typically not represented by a single image file, but can include many versions
            of the same image, as shown in <b>Figure 2</b> below. These versions, called <b>capture images</b>,
            are each designated an image state to distinguish different versions (see <b>Image States</b> table below)</p>
        <p>
            For example, a photo taken for a given date, time, and location is a capture. If you delete the
            image file associated with that capture, the capture still exists. This case is rare. What’s more
            common is that an image file associated with a capture is modified several times in the MLP workflow.
            Specifically, a capture is initially represented by a raw file (when the Hasselblad is used create
            the capture, this would be a 3FR file). The raw file would be converted into a tiff file.
            The tiff file would then be registered (aligned/overlaid) with the historic image.
        </p>
        <p>
            To recap, a capture can have zero to many capture images. Each capture image has both an image file
            and an image state, where the state distinguishes the versions of the image. All the capture images
            for a specific capture are derived (indirectly or directly) from the same image file (usually a raw file).
        </p>

        <Image url={captureModel}
               caption={`
               Figure 2. The relationship between a capture and its capture images shown pictorially. 
               The capture represents the photo taken at a specific time, while the capture images are 
               instances of that same photo, differentiated by image states,image modifications, and file types.`} />

        <h5>Image States</h5>
        <table className={'help'}>
            <tbody>
            <tr>
                <th>Raw</th>
                <td><p>Original uploaded image. Typically, the associated image format is uncompressed RAW captured by
                    a digital camera for modern images or a digital scanner for historic images.</p></td>
            </tr>
            <tr>
                <th>Master</th>
                <td><p>Mastered or registered image. Image is aligned and indexed with a historic or modern counterpart.</p></td>
            </tr>
            <tr>
                <th>Interim</th>
                <td><p>Intermediate state for image alignment.</p></td>
            </tr>
            <tr>
                <th>Gridded</th>
                <td><p>Grid lines are visible on the image.</p></td>
            </tr>
            <tr>
                <th>Miscellaneous</th>
                <td><p>Image has unconventional adjustments or transformations.</p></td>
            </tr>
            </tbody>
        </table>
    </>;

    /**
     * Explorer "Navigator" help page.
     *
     * @public
     */

    const navigatorExplorerHelp = <>
        <h4>Navigating the Collection</h4>
        <p>
            Use the navigator (located on the left-side panel) to search, filter and open up the vast
            MLP photographic library and database. Click on the <Icon type={'expand'} /> icon to open or close the submenus.
            Selecting or searching clickable items in the navigator loads
            metadata in the <b>Viewer</b> pane on the right.
        </p>

        <h5>Navigator Features</h5>
        <p>The navigators offers four ways to explore the collection:</p>
        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'map'} /></th>
                <th>Map</th>
                <td>
                    <p>The map navigator shows the geographical locations survey stations and other features on
                        a map. Multiple Stations are clustered in markers that show the cluster size.</p>
                    <p>Click on the cluster or station marker to view details in the view panel. Double click on the
                        marker to also zoom and center the map on the cluster.</p>
                    <p>Pan by dragging the map; zoom by double clicking the map area, or use the zoom controls at top
                        left. You can also view different base layers by clicking the layers icon at top right.</p>
                    <p>More information is provided in the <Button icon={'map'} label={'Map Tool Guide'} onClick={() => {gotoPage(1, 0)}} />.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'tree'} /></th>
                <th>Tree</th>
                <td>
                    <p>The list (or "hierarchical") navigator organizes the data by historical surveyor and
                        associated survey data.</p>
                    <p>Click on the menu labels to load data for an item in the viewer panel.</p>
                    <p>Note that each historic and Modern Capture is labelled using its field note photo reference
                        identifier. When this identifier is empty, the filename of one of its captures images is used. </p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'search'} /></th>
                <th>Search</th>
                <td>
                    <p>Query the data with full-text searches of the collection metadata. This loads results in
                        the navigator panel.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'filter'} /></th>
                <th>Filter</th>
                <td>
                    <p>Filter the map Station markers by surveyor, survey, survey season and Station
                        status (see "Station/Capture Status" below).</p>
                </td>
            </tr>
            <tr>
                <th>
                    <div><Icon type={'hopenleft'} /></div>
                    <div><Icon type={'hcloseleft'} /></div>
                </th>
                <th>Minimize / Maximize</th>
                <td>
                    <p>Minimizes or maximizes the navigator panel.</p>
                </td>
            </tr>
            </tbody>
        </table>

        <h5>Cookie Crumb Trail</h5>

        <p>The cookie crumb trail is a navigational aid that helps track the location of the page loaded relative to
        the navigator model.</p>

        <h5>View Menu</h5>

        <p>The view menu is just below the cookie crumb trail, and provides additional options.</p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'download'} /></th>
                <th className={'active'}>Download Package</th>
                <td>
                    <p>Download images selected as 'attached' files.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'sync'} /></th>
                <th>Refresh</th>
                <td>
                    <p>Refresh the view data.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'iat'} /></th>
                <th>Alignment Tool</th>
                <td>
                    <p>Navigate to the <Button icon={'iat'} label={'Alignment Tool'} onClick={() => {gotoPage(2, 0)}} /></p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'export'} /></th>
                <th>Export</th>
                <td>
                    <p>Export full capture metadata to various file formats (e.g., JSON, CSV).</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'help'} /></th>
                <th>Help</th>
                <td>
                    <p>Open the Help pages.</p>
                </td>
            </tr>
            </tbody>
        </table>

        <h5>Item Status</h5>
        <p>Icons used in the navigator tree are colour-coded to indicate the status of the metadata or images
        associated with that node.</p>

        <h6>Station Status</h6>
        <table className={'help'}>
            <thead>
            <tr>
                <th>Icon</th>
                <th>Status</th>
                <th>Description</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th className={'mastered'}><Icon type={'stations'} /></th>
                <th>
                    <p>Mastered Station</p>
                </th>
                <td>
                    <p>Station has been repeated and all of its captures have been mastered.</p>
                </td>
            </tr>
            <tr>
                <th className={'partial'}><Icon type={'stations'} /></th>
                <th>
                    <p>Partially Mastered Station</p>
                </th>
                <td>
                    <p>Station contains repeat captures and at least one of them has been mastered, while
                        others still require mastering.</p>
                </td>
            </tr>
            <tr>
                <th className={'repeated'}><Icon type={'stations'} /></th>
                <th>
                    <p>Repeated Station</p>
                </th>
                <td>
                    <p>Station contains repeat captures, but at least one of these captures need to be mastered
                        with its Historic Capture counterpart.</p>
                </td>
            </tr>
            <tr>
                <th className={'located'}><Icon type={'stations'} /></th>
                <th>
                    <p>Located Station</p>
                </th>
                <td>
                    <p>Station contains grouped Historic Captures and the location of the Station has been estimated.
                        Historic Captures have not been repeated.</p>
                </td>
            </tr>
            <tr>
                <th className={'grouped'}><Icon type={'stations'} /></th>
                <th>
                    <p>Grouped Station</p>
                </th>
                <td>
                    <p>Station contains Historic Captures that have been grouped together as a single
                        historic Station, but the location of this Station as not been estimated.</p>
                </td>
            </tr>
            </tbody>
        </table>

        <h6>Capture Status</h6>
        <table className={'help'}>
            <thead>
            <tr>
                <th>Icon</th>
                <th>Status</th>
                <th>Description</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th className={'mastered'}><Icon type={'historic_captures'} /></th>
                <th>
                    <p>Mastered Capture</p>
                </th>
                <td>
                    <p>Capture is sorted and has at least one image mastered with an historic/Modern Capture image.</p>
                </td>
            </tr>
            <tr>
                <th className={'partial'}><Icon type={'historic_captures'} /></th>
                <th>
                    <p>Partially Mastered Station</p>
                </th>
                <td>
                    <p>Capture contains repeat capture images and at least one of them has been mastered, while
                        others still require mastering.</p>
                </td>
            </tr>
            <tr>
                <th className={'repeated'}><Icon type={'historic_captures'} /></th>
                <th>
                    <p>Repeated Capture</p>
                </th>
                <td>
                    <p>Capture is sorted and has at least one image paired with an historic/Modern Capture image.</p>
                </td>
            </tr>
            <tr>
                <th className={'historic_captures'}><Icon type={'historic_captures'} /></th>
                <th>
                    <p>Sorted Capture</p>
                </th>
                <td>
                    <p>Capture is attached to either an: (1) Historic Visit for Historic Captures, or (2)
                    location for Modern Captures, but is not mastered.</p>
                </td>
            </tr>
            <tr>
                <th className={'unsorted'}><Icon type={'historic_captures'} /></th>
                <th>
                    <p>Unsorted Capture</p>
                </th>
                <td>
                    <p>Capture is <b>not</b> attached to either an: (1) Historic Visit for Historic Captures, or (2)
                        location for Modern Captures.</p>
                </td>
            </tr>
            <tr>
                <th className={'missing'}><Icon type={'historic_captures'} /></th>
                <th>
                    <p>Missing Images</p>
                </th>
                <td>
                    <p>Capture has zero attached capture images.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>;


    return [
        {
            label: 'Getting Started',
            data: explorerHelp,
        },
        {
            label: 'How Explorer is Organized',
            data: modelExplorerHelp,
        },
        {
            label: 'Understanding Captures',
            data: captureExplorerHelp,
        },
        {
            label: 'Navigating the Collection',
            data: navigatorExplorerHelp,
        },
        {
            label: 'Exploring the View',
            data: viewerExplorerHelp,
        },
    ];
}

export default explorerHelp;