/*!
 * MLE.Client.Components.Common.Image
 * File: image.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

import React from 'react';
import { schema } from '../../schema';
const fallbackSrc = schema.errors.image.fallbackSrc;

/**
 * Defines image component.
 *
 * @param url
 * @param title
 * @param caption
 * @param scale
 * @param fit
 * @param fixedHeight
 * @param onClick
 * @public
 * @return {JSX.Element}
 */

/**
 * Image component.
 *
 * This component renders an image element with the supplied URL
 * and optional title, caption, scale, fit, fixedHeight, and onClick
 * properties. The image is rendered with the object-fit property
 * set based on the scale property. If the image is not loaded, a
 * fallback image is rendered instead.
 * 
 * Note that cross-origin images are supported by using 'anonymous'.
 *
 * @param {string} url - URL of the image
 * @param {string} title - Title of the image
 * @param {string} caption - Caption of the image
 * @param {string} scale - Scale of the image (thumb, small, medium, large)
 * @param {string} fit - Fit of the image (contain, cover)
 * @param {boolean} fixedHeight - Whether the image should have a fixed height
 * @param {function} onClick - Function to call when the image is clicked
 * @returns {ReactElement} Image element
 */
const Image = ({
                   url=fallbackSrc,
                   title='',
                   caption ='',
                   scale='',
                   fit='contain',
                   fixedHeight=false,
                   onClick=()=>{},
}) => {

    const resolveImageSrc = (inputUrl, inputScale) => {
        const normalizeUploadURL = (candidate) => {
            if (!candidate || typeof candidate !== 'string') return candidate;

            try {
                const parsed = new URL(candidate, window.location.origin);
                if (parsed.pathname.startsWith('/uploads/')) {
                    return `${window.location.origin}${parsed.pathname}${parsed.search}`;
                }
            } catch (err) {
                return candidate;
            }

            return candidate;
        };

        if (!inputUrl) return fallbackSrc;

        if (typeof inputUrl === 'string') {
            return normalizeUploadURL(inputUrl);
        }

        if (typeof inputUrl !== 'object') {
            return fallbackSrc;
        }

        if (inputScale && inputUrl[inputScale]) {
            return inputUrl[inputScale];
        }

        const fallbackKeys = ['medium', 'large', 'small', 'thumb', 'url', 'src', 'original'];
        for (const key of fallbackKeys) {
            if (inputUrl[key]) return normalizeUploadURL(inputUrl[key]);
        }

        const firstValue = Object.values(inputUrl).find(value => typeof value === 'string' && value);
        return firstValue ? normalizeUploadURL(firstValue) : fallbackSrc;
    };

    // fallback for null or empty url
    if (!url || (typeof url === 'object' && Object.keys(url).length === 0)) {
        url = fallbackSrc;
    }
    const isFallback = url === fallbackSrc;

    // image URL: with scale settings / URL string
    const [src, setSrc] = React.useState(resolveImageSrc(url, scale));
    const [loaded, setLoaded] = React.useState(false );
    const [error, setError] = React.useState(false);

    // Handler for resource loading errors.
    // - uses fallback image
    const onError = () => {
        if (!error) {
            setSrc(fallbackSrc);
            setError(true);
        }
    }
    // ensure image source is valid
    React.useEffect(()=> {
        // reject invalid image source strings
        if (!src || (typeof src === 'object' && Object.keys(src).length===0)) {
            setSrc(fallbackSrc);
            setError(true);
        }
    }, [src, setSrc, setError])

    // update image source
    React.useEffect(()=> {
        if (!error) {
            setSrc(resolveImageSrc(url, scale));
        }
    }, [url, setSrc, scale, error])

    // render image
    // - thumbnails must use cover object-fit
    return (
        <figure className={scale}>
            <img
                className={error || !loaded || isFallback ? 'fallback' : ''}
                // crossOrigin={'anonymous'}
                style={{objectFit: scale === 'thumb' ? 'cover' : fit, maxHeight: fixedHeight ? '500px' : '100%'}}
                src={src}
                alt={caption}
                title={title}
                onLoad={() => setLoaded(true)}
                onError={onError}
                onClick={onClick}
            />
            {
                loaded
                    ? caption && <figcaption onClick={onClick}>{caption}</figcaption> : <span>Loading...</span>
            }
        </figure>
    )
}

export default Image;
