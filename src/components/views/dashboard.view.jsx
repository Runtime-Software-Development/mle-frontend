/*!
 * MLE.Client.Components.Views.Dashboard
 * File: dashboard.view.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * Description
 * Viewer dashboard component for MLE frontpage.
 *
 * Revisions
 * - 06-09-2023 Move image expand dialog to dialog selector.
 *
 */

import React from 'react'
import {viewerWelcome} from "../content/frontpage.static";
import {useRouter} from "../../providers/router.provider.client";
import {UserMessage} from "../common/message";
import {MLPLogo} from "../common/logo";
import {schema} from "../../schema";
import Slideshow from "../common/slideshow";


/**
 * Viewer dashboard component
 *
 * @public
 * @return {JSX.Element} result
 */

const DashboardView = () => {

    const [error, setError] = React.useState(null);
    const [images, setImages] = React.useState([]);
    const [loaded, setLoaded] = React.useState(false);

    const _isMounted = React.useRef(true);

    const router = useRouter();

    /**
     * Viewer slideshow: References Project with 'showcase' as the description
     * - Use unsorted captures for the slides.
     * - slide order = capture fn_photo_reference;
     * - slide caption = capture comments;
     * - slide title = capture label;
     * - slide link = capture digitization_location;
     *
     * @public
     * @return {JSX.Element} result
     */
    React.useEffect(() => {

        _isMounted.current = true;

        if (_isMounted.current && !error && !loaded) {

            // get project showcase data
            // - defined project ID
            router.get('/showcase')
                .then(res => {
                    // update state with response data
                    if (_isMounted.current) {
                        if (res.error) return setError(res.error);
                        const {response = {}} = res || {};
                        const {data = []} = response || {};

                        const sorter = function(a, b) {
                            try {
                                return (a.metadata.fn_photo_reference || '')
                                    .localeCompare(
                                        (b.metadata.fn_photo_reference || ''),
                                        undefined,
                                        { numeric: true, sensitivity: 'base' }
                                    );
                            } catch (err) {
                                console.error(err);
                            }
                        }

                        // sort by label
                        data.sort(sorter);

                        // load slideshow images
                        setImages(data.map(capture => {
                            const {refImage = {}, label = '', metadata = {}} = capture || {};
                            const {comments = '', digitization_location=''} = metadata || {};
                            refImage.caption = comments;
                            refImage.title = label;
                            refImage.link = digitization_location;
                            return refImage
                        }));
                        setLoaded(true);
                    }
                })
                .catch(err => console.error(err)
                );
            return () => {
                _isMounted.current = false;
            };
        }
    }, [error, router, images, loaded]);

    return <>
        {!error && <Slideshow
            fit={'cover'}
            fixedHeight={false}
            items={images}
            thumbnails={false}
            slideshow={true}
            autoslide={8000}
        />
            }
        <div className={'dashboard'}>
            <div className={'heading h-menu'}>
                <ul>
                    <li>
                        <div className={'logo'}><MLPLogo colour={'#EEEEEE'} /></div>
                    </li>
                    <li><h1>{schema.app.title}</h1></li>
                </ul>
            </div>
            { error && <UserMessage closeable={false} message={{msg: 'A server error has occurred. Try refreshing the page.', type: 'error'}} /> }
            <div className={'view-panel'}>
                { viewerWelcome }
            </div>
        </div>
    </>;
}

export default DashboardView;
