/*!
 * MLE.Client.Content.Help.Editor
 * File: editor.help.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import Icon from '../common/icon';

/**
 * Editor "Getting Started" help page.
 *
 * @public
 */

/**
 * Index of general help content
 */

const explorerHelp = (gotoPage) => {

    const editorStartHelp = <>
        <h4>Editor: Getting Started</h4>
        <p>
            Accessible to <em>Authenticated Users</em>, the Mountain Legacy Explorer (MLE) Editor
            can be used to manage the digital assets and metadata of the MLP collection. Through the Editor, users can
            upload or delete images in the collection data store, add and update image metadata, as well as align and
            master historic and repeat digital photographs.
        </p>

        <h5>Navigation</h5>

        <p>Editor navigation is identical to the Explorer. To edit elements on a page, use either
           the <b>editor tools</b> menu or <b>inline tool</b> menus to navigate to edit forms. </p>

        <h6>Editor Menu</h6>
        <p>
            Editor users will see the editor tools menu below the breadcrumb trail. This menu
            provides the available options for viewing, adding, editing or deleting the item loaded
            on the page. Administrators have additional options, such as image registration uploads.
        </p>

        <h6>Inline Menus</h6>
        <p>
            Inline menus appear where dependent nodes or items are displayed within a particular info page.
            These menus allow users to add, edit and delete dependent items within the page using dialog popups.
        </p>

        <h5>User Permissions</h5>
        <p>Authenticated users are assigned roles that have defined access permissions to Editor features, as shown in
            the table below. </p>
        <table className={'help'} style={{textAlign: 'center'}}>
            <thead>
            <tr>
                <th>Permissions</th>
                <th>Visitor</th>
                <th>Editor</th>
                <th>Administrator</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th>View</th>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
            </tr>
            <tr>
                <th>Download*</th>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
            </tr>
            <tr>
                <th>Raw Download*</th>
                <td>-</td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
            </tr>
            <tr>
                <th>Export</th>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
            </tr>
            <tr>
                <th>Create</th>
                <td>-</td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
            </tr>
            <tr>
                <th>Edit</th>
                <td>-</td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
            </tr>
            <tr>
                <th>Delete</th>
                <td>-</td>
                <td>-</td>
                <td><Icon type={'success'} /></td>
            </tr>
            <tr>
                <th>Upload</th>
                <td>-</td>
                <td>-</td>
                <td><Icon type={'success'} /></td>
            </tr>
            <tr>
                <th>Master</th>
                <td>-</td>
                <td>-</td>
                <td><Icon type={'success'} /></td>
            </tr>
            <tr>
                <th>Edit Options</th>
                <td>-</td>
                <td>-</td>
                <td><Icon type={'success'} /></td>
            </tr>
            </tbody>
        </table>
        <p><small>* All users have access to high-resolution versions of the images and metadata files. However, only
            authenticated users have access to the original image uploads.</small></p>
    </>;

    /**
     * Editor "Basic Features" help page.
     *
     * @public
     */

    const editorBasicHelp = <>
        <h4>Basic Features</h4>
        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'new'} /></th>
                <th>Add Surveyor / Project</th>
                <td>
                    <ol className={'list'}>
                        <li>
                            Click on the <b>Add New</b> dropdown menu and select
                            either <b>Add New Surveyor</b> or <b>Add New Project</b>.
                        </li>
                        <li>
                            Complete the update form and submit. If no errors occur, accept the prompt
                            confirming the update.
                        </li>
                        <li>
                            You will be redirected to the new page.
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'new'} /></th>
                <th>Add Other Items</th>
                <td>
                    <ol className={'list'}>
                        <li>
                            To add new items (e.g. a new survey or historic visit), first navigate to the
                            parent node of that item. For example, to add a survey to a specific surveyor, first
                            navigate
                            to that surveyor.
                        </li>
                        <li>
                            Click the <b>Add New</b> dropdown menu button and select
                            one of the dependent nodes (e.g. 'Add New Survey').
                        </li>
                        <li>
                            Complete the update form and submit. If no errors occur, accept the prompt
                            confirming the update.
                        </li>
                        <li>
                            You will be redirected to either the parent info page or the new item info page.
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'edit'} /></th>
                <th>Edit Items</th>
                <td>
                    <p>
                        To edit an item's metadata, click the <b>Edit</b> menu button,
                        complete the form and submit.
                    </p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'move'} /></th>
                <th>Move Capture</th>
                <td>
                    <p>To move a capture to a new owner, open the list (tree) navigator to a capture. Select the <Icon type={'move'} /> icon handle
                        to the left of the capture item and drag it to the new container in the list navigator. A confirmation dialog will pop-up for the move.</p>
                    <p>Refer to the table below for allowed owner-dependent relationships.</p>
                    <table className={'help'}>
                        <tbody>
                        <tr>
                            <th>Historic Captures</th>
                            <td>Projects, Surveys, Survey Seasons, Historic Visits</td>
                        </tr>
                        <tr>
                            <th>Modern Captures</th>
                            <td>Projects, Surveys, Survey Seasons, Stations, Modern Visits, Locations</td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <th><Icon type={'delete'} /></th>
                <th>Delete Items</th>
                <td>
                    <p>To delete an item, click the delete (trash can) menu button and
                        confirm the deletion. Note that deleting an item requires that all of the dependent
                        files have first been deleted.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>;

    /**
     * Editor "Capture Images" help page.
     *
     * @public
     */

    const editorImagesHelp = <>
        <h4>Handling Images</h4>

        <p>The Explorer editor allows authenticated users to upload and delete images in the MLP Library. There are
        three primary image types: (1) <b>historic capture</b> images;
            (2) <b>modern capture</b> images; and (3) <b>supplemental</b> images.</p>

        <p>Low resolution copies of uploaded raw image files (for both capture and supplemental images) are
            automatically generated for viewing on application pages. A large-format image (2100px width) is also generated as the
            print-ready version that can be downloaded by non-authenticated users. Authenticated users can download
            the original raw image files.</p>

        <h5>Supported Image Formats</h5>
        <p>The following image formats are supported in the Explorer and Image Analysis Toolkit.</p>
        <table className={'files'}>
            <thead>
            <tr>
                <th>Image Format</th>
                <th>Editor</th>
                <th>IAT</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>JPEG</td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
            </tr>
            <tr>
                <td>PNG</td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
            </tr>
            <tr>
                <td>TIF</td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
            </tr>
            <tr>
                <td>RAW</td>
                <td><Icon type={'success'} /></td>
                <td>-</td>
            </tr>
            <tr>
                <td>3RF<sup>1</sup></td>
                <td><Icon type={'success'} /></td>
                <td>-</td>
            </tr>
            <tr>
                <td>NEF<sup>2</sup></td>
                <td><Icon type={'success'} /></td>
                <td>-</td>
            </tr>
            <tr>
                <td>RAF<sup>3</sup></td>
                <td>-</td>
                <td>-</td>
            </tr>
            </tbody>
        </table>
        <p><sup>1</sup> <small>3RF is a camera raw image format proprietary to Hasselblad digital cameras.</small></p>
        <p><sup>2</sup> <small>NEF (Nikon Electronic Format) is a camera raw image format proprietary to Nikon digital cameras.</small></p>
        <p><sup>3</sup> <small>RAF is a camera raw image format proprietary to Fuji digital cameras.</small></p>

        <h5>Capture Images</h5>
        <p>A capture corresponds to the capture of a view that is unique in location, azimuth, date, and time.
            Captures contain multiple image versions, and come in two forms: historic and modern (repeat).</p>

        <p>Typically, captures are sorted into either historic visits (for historic captures) or locations (for modern
            captures). However, "unsorted" captures can also be stored at the project, survey, survey season,
            and station levels. In the list navigator, unsorted captures appear as red icons. For more information
            about historic and modern capture images, visit the
            <Button icon={'help'} label={'MLP Model'} onClick={() => {gotoPage(0, 3)
            }} /> help page.
        </p>

        <h6>Edit Options</h6>
        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'new'} /></th>
                <th>Add Capture Images</th>
                <td>
                    <p>Use this option to add capture image(s) to a single capture. A single capture image is
                        attached with the option of additional information such as digitization details,
                        camera settings, or Library Archives Canada (LAC) metadata.</p>
                    <ol className={'list'}>
                        <li>A single file can be attached by clicking the <b>Attach File</b> button or by
                            dragging and dropping files into the drop zone. At least one file is required.
                        </li>
                        <li>To attach additional files, click the <b>Add Image Upload</b> button. To delete any
                            additional attached images, click the <b>Delete Image Upload</b> button inside the fieldset.
                            Note the accepted image file formats in the <b>Image Formats</b> table above.
                        </li>
                        <li>Select an image state (required).</li>
                        <li>Enter any other metadata and submit.</li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'import'} /></th>
                <th>Import Captures</th>
                <td>
                    <p>Use this option to bulk import captures. Each attached image will generate a unique historic or
                        modern capture entry. Metadata included below will apply to each imported capture.</p>
                    <ol className={'list'}>
                        <li>Files can be attached by clicking the <b>Import Files</b> button or by
                            dragging and dropping files into the drop zone.
                        </li>
                        <li>Select an image state (required). This designation is applied to all of the attached images.
                        </li>
                        <li>Enter any other metadata and submit. This metadata is applied to all of the attached images.
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'edit'} /></th>
                <th>Edit Metadata</th>
                <td>
                    <p>
                        To edit capture image metadata, click the <b>Edit</b> menu button,
                        complete the form and submit.
                    </p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'delete'} /></th>
                <th>Delete Items</th>
                <td>
                    <p>To delete a capture image, click the <b>Delete</b> menu button, or
                        the <Icon type={'delete'}/> icon in the files table, and confirm the deletion.</p>
                </td>
            </tr>
            </tbody>
        </table>

        <h5>Supplemental Images</h5>

        <p>
            Supplemental images are images that do not represent a particular capture. These additional images
            can be attached to locations, stations, survey seasons, surveys and modern visits.
        </p>

        <h6>Edit Options</h6>
        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'new'} /></th>
                <th>Add New</th>
                <td>
                    <ol className={'list'}>
                        <li>
                            Navigate to the owner item. Click the <b>Add New</b> dropdown
                            menu button and select <b>Add New Supplemental Image</b>.
                        </li>
                        <li>
                            Complete the update form and submit. An Image Type (e.g. 'Location', 'Scenic' or 'Other) is
                            required. If no errors occur, accept the prompt confirming the update.
                        </li>
                        <li>
                            You will be redirected to either the parent info page or the new item info page.
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'edit'} /></th>
                <th>Edit Metadata</th>
                <td>
                    <p>
                        To edit supplemental image metadata, click the <b>Edit</b> menu button,
                        complete the form and submit.
                    </p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'delete'} /></th>
                <th>Delete Items</th>
                <td>
                    <p>To delete a supplemental image, navigate to the supplemental image info page,
                        click the <b>Delete</b> button in the editor tools menu, and confirm the deletion.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>;

    /**
     * Editor "Metadata Files" help page.
     *
     * @public
     */

    const editorMetadataHelp = <>
        <h4>Handling Metadata Files</h4>
        <p>
            The Mountain Legacy collection includes an extensive assortment of survey-related data including
            maps, diaries, and view indices that can be attached to a Survey, Survey Season, or Project item.
            Users can attached metadata files to Stations and Modern Visits. There are currently two categories of
            metadata:
        </p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'metadata'} /></th>
                <th>Field Notes</th>
                <td>Digitized records taken during modern repeat visits to the station</td>
            </tr>
            <tr>
                <th><Icon type={'metadata'} /></th>
                <th>Ancillary</th>
                <td>Miscellaneous metadata files.</td>
            </tr>
            </tbody>
        </table>

        <h5>Options</h5>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'add'} /></th>
                <th>Add Metadata Files</th>
                <td>
                    <ol className={'list'}>
                        <li>
                            For Field Notes files, navigate to a Modern Visit; for other Metadata Files, navigate to
                            either a Modern Visit or Station info page. Select the <b>Files</b> tab to view attached
                            files.
                        </li>
                        <li>
                            Click on the <Icon type={'add'} /> button from the dropdown on the right of the 'Metadata
                            Files'
                            list and select <b>Add New Metadata File</b> to attach a file.
                        </li>
                        <li>
                            Attach a file using the file loader and choose a metadata type (e.g. 'Field Notes or
                            'Ancillary')
                            and submit.
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'edit'} /></th>
                <th>Edit Metadata Type</th>
                <td>
                    <p>You can change the metadata type of files by clicking on the <b>Edit</b> next to the file in the
                        table.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'delete'} /></th>
                <th>Delete Metadata Files</th>
                <td>

                    <p>Click the <b>Delete</b> button to delete a file and its metadata from the collection.
                        You will be prompted to confirm the deletion.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>;

    /**
     * Editor "Metadata Files" help page.
     *
     * @public
     */

    const editorOptionsHelp = <>
        <h4>Handling Metadata Options</h4>
        <p>
            Metadata options are global parameters available for select options in dropdown lists and other enumerated data.
            Administrators can edit these settings by clicking the <Icon type={'options'} /> <b>Options</b> menu item
            from the editor tools menu. This will open the options dialog popup.
        </p>
        <p>To add a new option, click the <Icon type={'add'}/> icon, or select an option to view available editing options.
        Once you have completed updating the options, close the popup. Note that this will reload the page.</p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'metadata'} /></th>
                <th>Field Notes</th>
                <td>Digitized records taken during modern repeat visits to the station</td>
            </tr>
            <tr>
                <th><Icon type={'metadata'} /></th>
                <th>Ancillary</th>
                <td>Miscellaneous metadata files.</td>
            </tr>
            </tbody>
        </table>

        <h5>Options</h5>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'historic_captures'} /></th>
                <th>Camera Type</th>
                <td>
                    <p>Edit available camera makes and models.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'historic_captures'} /></th>
                <th>Lens Type</th>
                <td>
                    <p>Edit available lens makes and models.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'participant_groups'} /></th>
                <th>Participants</th>
                <td>
                    <p>Edit available group participants for modern visits.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'participant_groups'} /></th>
                <th>Group Types</th>
                <td>
                    <p>Edit available group types for modern visits.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'images'} /></th>
                <th>Image Types</th>
                <td>
                    <p>Edit available supplementary image types.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'metadata_files'} /></th>
                <th>Metadata Types</th>
                <td>
                    <p>Edit available metadata types.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>;

    const masteredImages = <>
        <h4>Mastered Captures</h4>
        <p>Historic and modern capture images must be classified as <b>Mastered</b> (the selected image state) to be used
            in image comparison pairs. Since captures contain multiple images versions - including multiple mastered images -
            the <b>particular image used in historic and modern comparisons is the last updated mastered image</b>.
        To select an image as the selected mastered image, open the editor dialog for that image and click update.</p>
            <p>Mastered images must also meet the following preconditions:</p>
        <ol className={'list'}>
            <li><b>Capture images must be aligned</b> Both capture image must be properly aligned and registered using
                an image editing software application or other tool. Explorer has a built-in Alignment tool that allows users
                to align two images using homographic transformations. Refer to instructions
                in the <Button icon={'help'} label={'Alignment Tool'} onClick={() => {gotoPage(2, 0)}} /> tab for details.</li>
            <li><b>Capture images must be sorted</b> The historic and modern capture images must be attached to a
                historic visit and location (modern visit) respectively, which are associated
                with a common station node.
            </li>
        </ol></>;

    const mapFeatures = <>
        <h4>Map Features</h4>
        <p>Explorer's map-based navigation tool (
            <Button icon={'help'} label={'Map Tool'} onClick={() => {gotoPage(1, 0)}} />
            ) has integrations for adding and displaying features such as topographical surveys,
            map plots and other types of map visualizations. These features can be added to Explorer by uploading
            KML or Keyhole Markup Language XML data that expresses geographic metadata
            into visualizations and then linked to Explorer metadata.</p>
        <p>Map Objects (or 'Feature Groups') are data structures in Explorer used to organize groups of map
            features. Map Objects have a name, type and description, and one or more attached KMZ files, which are
            compressed KML metadata files uploaded to Explorer. From these KMZ files, users can
            extract geometric data as separate Map Features visualized on the navigation map.
            Each extracted Map Feature has a name, type and description,
            as well as a snippet of geoJSON that encodes the location and geometry of the feature.</p>
        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'new'} /></th>
                <th>Create Map Object</th>
                <td>
                    <ol className={'list'}>
                        <li>
                            Log into Explorer
                        </li>
                        <li>
                            Click <Button icon={'new'} label={'New'} /> and then 'Add new Map Feature Group' from dropdown menu.
                        </li>
                        <li>
                            Enter a unique name for the group, its description, and select the object type (e.g., Mapsheet)
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'upload'} /></th>
                <th>Upload KMZ files</th>
                <td>
                    <ol className={'list'}>
                        <li>
                            Log into Explorer
                        </li>
                        <li>
                            Select and load a Map Object from the tree navigator menu.
                        </li>
                        <li>
                            Click <Button type={'new'} label={'Add new metadata file'} /> to upload and attach the KMZ metadata file.
                        </li>
                        <li>
                            Choose the file in the upload dialog and select 'Geographic Map Data' as the metadata file type.
                        </li>
                        <li>
                            Click 'Add' to attach the file to the Map Object.
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'extract'} /></th>
                <th>Extract Map Features</th>
                <td>
                    <ol className={'list'}>
                        <li>
                            Log into Explorer
                        </li>
                        <li>
                            Click <Button icon={'extract'} label={'Extract Map Features'} /> from the panel menu to open the extract dialog.
                        </li>
                        <li>
                            Select from the uploaded metadata files for extraction.
                        </li>
                        <li>
                            Click 'Extract Map Features' button to show available features.
                        </li>
                        <li>
                            Select one or more features to added to add to Feature Group and click 'Extract'.
                        </li>
                        <li>
                            Added features will be highlighted in the response message.
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'edit'} /></th>
                <th>Update Map Feature</th>
                <td>
                    <ol className={'list'}>
                        <li>
                            Log into Explorer
                        </li>
                        <li>
                            Load the Map Feature or Map Features Group to edit.
                        </li>
                        <li>
                            Click the edit icon to open the Edit Dialog.
                        </li>
                        <li>
                            Update the metadata and save.
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'maps'} /></th>
                <th>Link Map Feature</th>
                <td>
                    <ol className={'list'}>
                        <li>
                            Log into Explorer
                        </li>
                        <li>
                            Search or load the Survey Season to link with map features.
                        </li>
                        <li>
                            Click the edit icon to open the Edit Dialog.
                        </li>
                        <li>
                            Click the 'Maps' dependents editor
                        </li>
                        <li>
                            Click the edit icon for the map to be linked.
                        </li>
                        <li>
                            Filter or select the Map Feature to link and save.
                        </li>
                        <li>
                            <Button icon={'maps'} label={'View on Map'} /> button will now appear in the metadata view for that Survey Season map.
                        </li>
                    </ol>
                </td>
            </tr>
            </tbody>
        </table>
    </>;

    // index of editor help content
    return [
        {
            label: 'Getting Started',
            data: editorStartHelp,
        },
        {
            label: 'Basic Features',
            data: editorBasicHelp,
        },
        {
            label: 'Handling Images',
            data: editorImagesHelp,
        },
        {
            label: 'Mastered Captures',
            data: masteredImages,
        },
        {
            label: 'Metadata Files',
            data: editorMetadataHelp,
        },
        {
            label: 'Metadata Options',
            data: editorOptionsHelp,
        },
        {
            label: 'Map Features',
            data: mapFeatures,
        },
    ];
}

export default explorerHelp;