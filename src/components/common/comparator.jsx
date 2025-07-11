/*!
 * MLE.Client.Components.Common.Comparator
 * File: comparator.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Image from './image';
import Loading from "./loading";
import Slider from "./slider";
import {createNodeRoute} from "../../utils/paths.utils.client";
import {useRouter} from "../../providers/router.provider.client";


/**
 * Image pair component.
 *
 * @public
 * @param {Boolean} selected
 * @param {Object} historicImage
 * @param {Object} modernImage
 * @return
 */

const ImagePair = ({
                       selected = false,
                       historicImage,
                       modernImage
                   }) => {

    const pairRef = React.useRef();

    // auto-increment slideshow
    // scroll to current top node
    React.useEffect(() => {
        if ( pairRef.current && selected) {
            pairRef.current.scrollIntoView();
        }
        return () => {};
    }, [selected]);

    return <div ref={pairRef} className={`h-menu comparison-pair ${selected ? 'active' : ''}`}>
        <ul>
            <li>
                <Image
                    scale={'thumb'}
                    caption={historicImage.label || ''}
                    url={historicImage.url || ''}
                />
            </li>
            <li>
                <Image
                    scale={'thumb'}
                    caption={modernImage.label || ''}
                    url={modernImage.url || ''}
                />
            </li>
        </ul>
    </div>

}
/**
 * Image comparator component.
 *
 * @public
 * @param {Array} images
 * @param menu
 * @param display
 * @return {JSX.Element}
 */

const Comparator = ({
                        images = [],
                        autoslide=null,
                        expandable=true
                    }) => {

    // slide panel reference
    const slidePanel = React.useRef();                            
    // selected slide state
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    // const [expandImage, setExpandImage] = React.useState(false);
    let selectedPair = images[selectedIndex];
    
    // retrieve captures from pair
    const { historic_captures={}, modern_captures={} } = selectedPair || {};

    // get router
    const router = useRouter();

    // extract metadata from capture object
    const getMetadata = (capture) => {
        const { refImage={} } = capture || {};
        const { label='', file={}, url='', title='' } = refImage;
        const { file_type='', owner_id='', owner_type='' } = file;
        return {
            label : label || '<No Label>',
            title: title || '<No Title>',
            url: createNodeRoute(owner_type, 'show', owner_id)
        }
    }
    const modernMetadata = getMetadata(modern_captures);
    const historicMetadata = getMetadata(historic_captures);


    // select image pair
    React.useEffect(() => {
        const timer = autoslide ? setTimeout(() => {
            setSelectedIndex((selectedIndex + 1) % images.length);
        }, autoslide) : null;
        return () => {
            clearTimeout(timer);
        };
    }, [selectedIndex]);

    // auto-increment slideshow
    React.useEffect(() => {
        const timer = autoslide ? setTimeout(() => {
            setSelectedIndex((selectedIndex + 1) % images.length);
        }, autoslide) : null;
        return () => {
            clearTimeout(timer);
        };
    }, [selectedIndex, images.length, setSelectedIndex, autoslide]);


    // increment/decrement index to make slide visible
    const prevPair = () => {
        const prevIndex = (selectedIndex - 1 + images.length) % images.length;
        setSelectedIndex(prevIndex);
    };
    const nextPair = () => {
        const nextIndex = (selectedIndex + 1) % images.length
        setSelectedIndex(nextIndex);
    };

    return (
        <div className="comparator">
            <div ref={slidePanel} className={'slides'}>
                { 
                    images.length > 0 ? 
                    <Slider images={[historic_captures.refImage, modern_captures.refImage]} /> 
                    : 
                    <Loading /> 
                }
                <div className={'numbertext'}>{ selectedIndex + 1 }/{images.length}</div>
                {/* {
                    expandable &&
                    <div className={'expand-image'}><Button icon={'enlarge'} onClick={() => {
                        setExpandImage(true);
                    }}/></div>
                } */}
            </div>
            {
                <div className={'slide-menu h-menu vcentered'}>
                    <ul>
                        <li><Button icon={'prev'} className={'prev'} onClick={prevPair} /></li>
                        <li>Historic:</li>
                        <li><Button
                            title={'View Capture Details'}
                            label={historicMetadata.label}
                            className={'capture-button historic_captures'}
                            icon={'historic_captures'}
                            onClick={()=>{router.update(historicMetadata.url)}}
                        /></li>
                        <li>Modern:</li>
                        <li><Button
                            title={'View Capture Details'}
                            label={modernMetadata.label}
                            className={'capture-button modern_captures'}
                            icon={'modern_captures'}
                            onClick={()=>{router.update(modernMetadata.url)}}
                        /></li>
                        <li className={'push'}><Button icon={'next'} className={'next'} onClick={nextPair} /></li>
                    </ul>
                </div>
            }
                    <div className={'thumbnails comparisons h-menu'}>
                        <ul>
                            {
                                (images || []).map((imgPair, index) => {
                                    const { historic_captures={}, modern_captures={} } = imgPair || {};
                                    return (
                                        <li
                                            key={`slide_button_${index}`}
                                            onClick={(e) => {
                                                e.stopPropagation(); setSelectedIndex(index)}
                                            }
                                        >
                                            <ImagePair
                                                historicImage={historic_captures.refImage}
                                                modernImage={modern_captures.refImage}
                                                selected={index === selectedIndex}
                                            />
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </div>
        </div>
    );
};

export default Comparator;