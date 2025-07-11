/*!
 * MLE.Client.Components.Common.Slideshow
 * File: slideshow.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Image from './image';
import {useRouter} from "../../providers/router.provider.client";
import {genID} from "../../utils/data.utils.client";
import {useDialog} from "../../providers/dialog.provider.client";

/**
 * Image slideshow component.
 *
 * @public
 * @param {Array} images
 * @param {String} fit
 * @param {Boolean} fixedHeight
 * @param {int} autoslide
 * @param {Boolean} expandable
 * @return {JSX.Element}
 */

const slideshowKey = genID();

const Slideshow = ({
                       items = [],
                       fit='contain',
                       fixedHeight=false,
                       autoslide=null,
                       expandable=true,
                   }) => {

    const router = useRouter();
    const dialog = useDialog();

    // selected slide states
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [captionToggle, setCaptionToggle] = React.useState(true);
    const selectedSlide = React.useRef();
    const selectedImage = items[selectedIndex];

    // destructure selected slide image
    const { url={}, label='', title='', link='' } = selectedImage || {};

    // increment/decrement index to make slide visible
    const _prevSlide = () => {
        setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
    };
    const _nextSlide = () => {
        setSelectedIndex((selectedIndex + 1) % items.length);
    };

    // show slide captions inset
    const _showCaptions = () => {
        setCaptionToggle(!captionToggle);
    };

    // redirect to link
    const _handleLink = () => {
        return link ? router.update(link) : null;
    }

    // show slide image in enlarged view
    const _handleExpandImage = () => {
        dialog.setCurrent({
            dialogID: 'image',
            url: url,
            label: title || label,
            scale: 'medium'
        });
    }

    // auto-increment slideshow
    React.useEffect(() => {
        const timer = autoslide ? setTimeout(() => {
            setSelectedIndex((selectedIndex + 1) % items.length);
        }, autoslide) : null;
        return () => {
            clearTimeout(timer);
        };
    }, [selectedIndex, items.length, setSelectedIndex, autoslide, selectedSlide]);

    return <div className="carousel">
        <div>
            {
                (!selectedImage || items.length === 0) && <Image />
            }
            {
                items.length > 0 && <div className={`slides fade'}`}>
                    {
                        items.map((image, index) => {
                            const {url = null} = image || {};
                            return <div
                                ref={index === selectedIndex ? selectedSlide : null}
                                key={`slideshow_${slideshowKey}_slide_${index}`}
                                className={`slide fade`}
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
                                    onClick={_handleLink}
                                />
                                {
                                    captionToggle && image.caption &&
                                    <div className={'caption'}>
                                        <p>{image.caption}</p>
                                    </div>
                                }
                            </div>
                        })
                    }
                    <div className={'numbertext'}>{selectedIndex + 1}/{items.length}</div>
                    {
                        expandable &&
                        <div className={'expand-image'}>
                            <Button icon={'enlarge'} onClick={_handleExpandImage}/>
                        </div>
                    }
                </div>
            }
        </div>
        <div className={'slide-menu h-menu vcentered'}>
            <ul>
                <li><Button icon={'prev'} className={'prev'} onClick={_prevSlide} /></li>
                <li style={{flexGrow: 1}} className={'centred'}>
                    <div className={'dots'}>
                        {
                            (items || []).map((image, index) => {
                                return (
                                    <span
                                        key={`carousel_img_${index}`}
                                        className={`dot${index === selectedIndex ? ' active' : ''}`}
                                        onClick={() => {setSelectedIndex(index)}}
                                    />);
                            })
                        }
                    </div>
                </li>
                <li>
                    <Button
                        label={captionToggle ? 'Hide Captions' : 'Show Captions'}
                        icon={'info'}
                        onClick={_showCaptions}
                    />
                </li>
                <li className={'push'}>
                    <Button icon={'next'} className={'next'} onClick={_nextSlide} />
                </li>
            </ul>
        </div>
    </div>
};

export default React.memo(Slideshow);