/*!
 * MLE.Client.Components.Common.Carousel
 * File: carousel.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Image from './image';
import Dialog from './dialog';
import { getModelLabel } from '../../services/schema.services.client';
import {useRouter} from "../../providers/router.provider.client";
import EditorMenu from "../menus/editor.menu";
import {useDialog} from "../../providers/dialog.provider.client";
import {genID} from "../../utils/data.utils.client";
import {createNodeRoute} from "../../utils/paths.utils.client";
import {useUser} from "../../providers/user.provider.client";

const carouselID = genID();

/**
 * Image carousel component.
 *f
 * @public
 * @param {Array} items
 * @param fit
 * @param fixedHeight
 * @param expandable
 * @return {JSX.Element}
 */

const Carousel = ({
                      items = [],
                      fit='contain',
                      fixedHeight=false
                  }) => {

    // selected slide states
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [expandImage, setExpandImage] = React.useState(false);
    const selectedImage = items[selectedIndex];

    const router = useRouter();
    const dialog = useDialog();
    const user = useUser();

    // destructure item data
    const { id='', model='', url={}, label='', metadata={}, node={} } = selectedImage || {};

    // create view link for selected image
    const isCapture = model === 'historic_captures' || model === 'modern_captures';
    const modelLabel = getModelLabel(model);
    const itemLink = createNodeRoute(model, 'show', id);

    // increment/decrement index to make slide visible
    const _prevSlide = () => {
        setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
    };
    const _nextSlide = () => {
        setSelectedIndex((selectedIndex + 1) % items.length);
    };
    // image enlarged view
    const _handleExpandOpen = () => {
        setExpandImage(true);
    }
    const _handleExpandClose = () => {
        setExpandImage(false);
    }
    // handle item selection
    const _handleSelection = (id) => {
        setSelectedIndex(id);
    }
    // handle item move
    const _handleMove = (e, item) => {
        // attach node metadata to data transfer object
        e.dataTransfer.setData(
            'application/json',
            JSON.stringify(item)
        );
    }


    return <div className="carousel">
        {
            (!selectedImage || items.length === 0) && <Image />
        }
        {
            items.length > 0 &&
            <div>
                <div className={'slides'}>
                    {
                        items.map((item, index) => {
                            const {url = null, model = '', id = ''} = item || {};
                            return <div
                                key={`carousel_${carouselID}_slide_${index}`} className={`slide`}
                                style={{
                                    opacity: index === selectedIndex ? 1.0 : 0,
                                    position: index === selectedIndex ? 'relative' : 'absolute'
                                }}
                            >
                                <Image
                                    url={url}
                                    scale={'medium'}
                                    fit={fit}
                                    fixedHeight={fixedHeight}
                                    title={`Go to ${label} ${modelLabel} page.`}
                                    onClick={() => {
                                        return router.update(createNodeRoute(model, 'show', id));
                                    }}
                                />
                            </div>
                        })
                    }
                    <div className={'numbertext'}>{selectedIndex + 1}/{items.length}</div>
                    <div className={'expand-image'}><Button icon={'enlarge'} onClick={_handleExpandOpen}/></div>
                </div>
                <div className={'slide-menu h-menu vcentered'}>
                    <ul>
                        <li><Button icon={'prev'} className={'prev'} onClick={_prevSlide}/></li>
                        <li>{label || modelLabel}</li>
                        {
                            <li className={'push'}>
                                <Button
                                    className={'capture-button'}
                                    label={`${modelLabel} Info`}
                                    title={`${modelLabel} Details`}
                                    icon={'info'}
                                    onClick={() => {
                                        dialog.setCurrent({
                                            dialogID: 'show',
                                            id: id,
                                            node: node,
                                            model: model,
                                            label: label,
                                            metadata: metadata
                                        });
                                    }}
                                />
                            </li>
                        }
                        <li className={`${metadata ? '' : 'push'}`}>
                            <Button
                                label={'Go to Page'}
                                title={'Open Capture'}
                                className={'capture-button'}
                                icon={'externalLink'}
                                onClick={() => {
                                    router.update(itemLink)
                                }}
                            />
                        </li>
                        <li><Button icon={'next'} className={'next'} onClick={_nextSlide}/></li>
                    </ul>
                </div>
                <div className={'thumbnails h-menu'}>
                    <ul>
                        {
                            (items || []).map((item, index) => {
                                const {
                                    id='',
                                    model='',
                                    node={},
                                    metadata={},
                                    url = null,
                                    owner={},
                                    label = ''} = item || {};

                                return <li key={`slide_button_${index}`}>
                                    <div className={user ? 'move' : ''}
                                         draggable={user && isCapture}
                                         onDragStart={(e)=>{
                                             _handleMove(e, item)
                                         }}
                                    >
                                        {
                                            user && isCapture &&
                                            <div style={{position: 'absolute', marginTop: '-5px'}}>
                                                <Button className={'capture-draggable'} size={'lg'} icon={'move'}/>
                                            </div>
                                        }
                                        <Image
                                            url={url}
                                            title={label}
                                            caption={label}
                                            scale={'thumb'}
                                            onClick={() => {
                                                _handleSelection(index)
                                            }}
                                        />
                                        {
                                            user &&
                                            <EditorMenu
                                                className={'centered'}
                                                size={'sm'}
                                                model={model}
                                                id={id}
                                                node={node}
                                                owner={owner}
                                                metadata={metadata}
                                                visible={['show', 'edit', 'remove', isCapture ? '' : 'download']}
                                            />
                                        }
                                    </div>
                                </li>;
                            })
                        }
                    </ul>
                </div>
                {
                    expandImage &&
                    <Dialog className={'wide'} title={`${modelLabel}: ${label}`} callback={_handleExpandClose}>
                        <Image
                            fit={'contain'}
                            key={`slide_${selectedIndex}`}
                            url={url}
                            title={label}
                            scale={'medium'}
                        />
                    </Dialog>
                }
            </div>
        }
    </div>;
};

export default Carousel;