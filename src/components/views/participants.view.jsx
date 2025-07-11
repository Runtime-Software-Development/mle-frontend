/*!
 * MLE.Client.Components.Editors.Participants
 * File: participants.view.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * View component to display modern visit participants.
 *
 * ---------
 * Revisions
 * - 22-07-2023 Simplified participant group attached metadata edits
 */

import React from 'react';
import {humanize} from '../../utils/data.utils.client';
import {getModelLabel} from "../../services/schema.services.client";
import Accordion from "../common/accordion";
import EditorMenu from "../menus/editor.menu";
import MetadataView from "./metadata.view";

/**
 * Attached node data component.
 * - renders metadata attached to primary node
 * - default: metadata shown in table
 *
 * @public
 * @param {Object} metadata
 * @param owner
 * @param editor
 * @return {JSX.Element}
 */

export const ParticipantsView = ({metadata, owner, editor=true}) => {

    const model = 'participant_groups';
    const label = getModelLabel(model, 'label');
    let pgID, createdAt, updatedAt;

    // get participant data
    const participants = Object.keys(metadata || {})
        .sort()
        .reduce((pgMetadata, pgroup) => {
            // get participant group metadata and add to attached metadata
            pgMetadata[pgroup] = {
                id: owner.id || '',
                label: humanize(pgroup),
                model: pgroup,
                data: metadata[pgroup].map(participant => {
                    const {pg_id, pg_updated_at, pg_created_at} = participant || {};
                    pgID = pg_id; updatedAt = pg_updated_at; createdAt = pg_created_at;
                    return {
                        value: participant.id,
                        label: participant.full_name,
                        updated_at: participant.updated_at,
                        created_at: participant.created_at
                    };
                })
            };
            return pgMetadata;
        }, {} );

        // map participant groups as single attached item
        const participant_groups = {
            id: pgID || '',
            label: humanize(model),
            model: model,
            data: participants,
            created_at: createdAt,
            updated_at: updatedAt
        };

    // iterate over attached data types
    return <Accordion
        type={'participants'}
        label={label}
        className={model}
        menu={editor && <EditorMenu
            id={owner.id || null}
            owner={owner}
            visible={['edit', 'remove']}
            label={getModelLabel(model, 'label')}
            model={model}
            metadata={participants}
        />}
    >
        <div className={model}>
            <div className={'h-menu'}>
                <MetadataView
                    model={model}
                    label={label}
                    node={participant_groups}
                    metadata={participants}
                />
            </div>
        </div>
    </Accordion>
};
