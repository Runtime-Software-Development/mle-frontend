/*!
 * MLE.Client.Components.Views.Attached
 * File: attached.view.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * View component for attached metadata.
 *
 * ---------
 * Revisions
 * - 22-07-2023 Created new component.
 */

import Accordion from "../common/accordion";
import {getModelLabel} from "../../services/schema.services.client";
import React from "react";
import MetadataView from "./metadata.view";
import {genID} from "../../utils/data.utils.client";
import {ParticipantsView} from "./participants.view";

/**
 * Attached node data component.
 * - renders metadata attached to primary node
 *
 * @public
 * @param {Object} owner
 * @param {Object} attached
 * @return {JSX.Element} component
 */

// generate random key
const keyID = genID();

export const AttachedMetadataView = ({owner, attached}) => {

    // iterate over attached data types
    return Object.keys(attached || {}).map((attachedModel, idx_attached) => {
            return <div key={`${keyID}_attached_${attachedModel}_${idx_attached}`}>
                {
                    // participant node attachments
                    attachedModel === 'participant_groups' && Object.keys(attached[attachedModel]).length > 0 &&
                     <ParticipantsView owner={owner} metadata={attached[attachedModel]} editor={false }/>
                }
                {
                    // other node attachments
                    attachedModel !== 'comparisons' && Array.isArray(attached[attachedModel]) && attached[attachedModel].length > 0 &&
                    <Accordion
                        type={attachedModel}
                        label={`${getModelLabel(attachedModel, 'label')}`}
                        className={attachedModel}
                        open={true}
                    >
                        <div className={attachedModel}>
                            {
                                attached[attachedModel].map((attachedItem, index) => {
                                    const {label = '', data = {}} = attachedItem || {};
                                    return <MetadataView
                                            key={`${keyID}_attached_${attachedModel}_${index}`}
                                            model={attachedModel}
                                            node={attachedItem}
                                            owner={owner}
                                            label={label}
                                            metadata={data}
                                        />
                                })
                            }
                        </div>
                    </Accordion>
                }
            </div>
        }
    )};