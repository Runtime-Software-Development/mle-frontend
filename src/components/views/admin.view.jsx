/*!
 * MLE.Client.Components.Views.Admin
 * File: admin.view.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

import { useEffect, useState, memo, useRef } from 'react';
import { UserMessage } from "../common/message";
import { useUser } from "../../providers/user.provider.client";
import { useRouter } from "../../providers/router.provider.client";
import { useDialog } from "../../providers/dialog.provider.client";
import Accordion from '../common/accordion';
import Table from '../common/table';
import Button from '../common/button';
import Loading from '../common/loading';
import Badge from '../common/badge';

/**
 * Render admin panel component (super-administrator users).
 *
 * @public
 * @returns {JSX.Element} result
 */
const AdminView = () => {
    const user = useUser();
    const router = useRouter();
    const dialog = useDialog();

    const [message, setMessage] = useState(null);
    const [pendingJobs, setPendingJobs] = useState([]);
    const [jobCounts, setJobCounts] = useState([]);
    const [applicationLogs, setApplicationLogs] = useState([]);
    const [systemStatus, setSystemStatus] = useState([]);
    const [loading, setLoading] = useState(false);
    const isAdmin = user?.role?.[0] === 'administrator' || user?.role?.[0] === 'super_administrator';

    /**
     * Refresh the status of the integrated systems.
     * Stores a list of pending job details.
     * server: {
        status: <boolean> true/false,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        },
        database: {
            status: <boolean> true/false
        },
        processor: {
            status: <boolean> true/false
        },
        queue: {
            status: <boolean> true/false
        },
        idp: {
            status: <boolean> true/false
        },
     *
     * @private
     * @return {Promise<void>} - Resolves when the jobs have been refreshed.
     */

    const _refreshStatus = async () => {
        setLoading(true);
        router.get('/admin/status')
            .then(res => {

                if (!res || res.error) {
                    return setMessage({
                        msg: res?.error?.msg || 'Error occurred.',
                        type: 'error'
                    });
                }

                // set system statuses in state
                setSystemStatus(res.response?.data || []);

            }).catch(err => {
                setMessage({
                    msg: err?.message || 'Error occurred.',
                    type: 'error'
                });
            }).finally(() => setLoading(false));
    };

    /**
     * Refresh the list of jobs in the queue.
     * Stores a list of pending job details.
     * {name: 'jobId', label: 'Job ID'}, 
        {name: 'status', label: 'Status'},
        {name: 'timestamp', label: 'Timestamp'},
        {name: 'finishedOn', label: 'Finished On'},
        {name: 'processedOn', label: 'Processed On'},
        {name: 'error', label: 'Error'},
        {name: 'data', label: 'Job Data'}
     *
     * @private
     * @return {Promise<void>} - Resolves when the jobs have been refreshed.
     */

    const _refreshLogs = async () => {
        setLoading(true);
        router.get('/admin/logs')
            .then(res => {

                if (!res || res.error) {
                    return setMessage({
                        msg: res?.error?.msg || 'Error occurred.',
                        type: 'error'
                    });
                }

                // set logs in state
                setApplicationLogs(res.response?.data || []);

            }).catch(err => {
                setMessage({
                    msg: err?.message || 'Error occurred.',
                    type: 'error'
                });
            }).finally(() => setLoading(false));
    };

    /**
     * Show details of a job in the pending jobs table.
     *
     * @private
     * @param {Object} job - The job to show details for
     * @param {string} job.jobId - The ID of the job
     * @param {string} job.status - The status of the job
     * @param {Date} job.timestamp - The timestamp of the job
     * @param {Date} job.finishedOn - The date and time the job finished
     * @param {Date} job.processedOn - The date and time the job was processed
     * @param {string} job.error - The error message if the job failed
     * @param {Object} job.data - The job data
     * @returns {JSX.Element} a JSX element displaying the job details
     */
    const _showDetails = (job) => {
        const { jobId, status, timestamp, finishedOn, processedOn } = job;
        const data = JSON.parse(job?.data || '{}');
        const error = JSON.parse(job?.error) || job?.error || '{}';
        // console.log('Job Details:', jobId, status, timestamp, finishedOn, processedOn, data, error);
        dialog.setCurrent({
            dialogID: 'show',
            model: 'jobs',
            label: `Job ${jobId} Details`,
            metadata: {
                job_id: jobId,
                status,
                timestamp,
                finished_on: finishedOn,
                processed_on: processedOn,
                error,
                process_type: data?.process_type,
                id: data?.file?.id,
                file_type: data?.file?.file_type,
                owner_id: data?.file?.owner_id,
                owner_type: data?.file?.owner_type,
                fs_path: data?.file?.fs_path,
                mimetype: data?.file?.mimetype,
                filename: data?.file?.filename,
                file_size: data?.file?.file_size,
                filename_tmp: data?.src || data?.file?.filename_tmp,
                created_at: data?.file?.created_at,
                updated_at: data?.file?.updated_at,
                published: data?.file?.published,
                image_state: data?.file_model?.image_state,
                container_id: data?.owner?.owner_id,
                container_type: data?.owner_type,
                container_fs_path: data?.owner_fs_path,
                secure_token: data?.file_model?.secure_token,
                version_raw_path: data?.versions?.raw?.path,
                version_thumb_path: data?.versions?.thumb?.path,
                version_medium_path: data?.versions?.medium?.path,
                version_full_path: data?.versions?.full?.path,
            },
        });
    };

    /**
     * Retry a job with the given ID.
     *
     * @param {string} jobId - The ID of the job to retry.
     * @returns {Promise<void>} - Resolves when the job has been retried.
     *
     * This function makes a GET request to the /admin/jobs/retry/:jobId endpoint.
     * The endpoint will return the job details with the status set to 'pending'.
     * The function will then return the job details with the processedOn and finishedOn
     * timestamps converted to locale strings.
     */
    const _retryJob = async (jobId) => {
        // Display date for retry
        const display_format_options = { year: 'numeric', month: 'short', day: 'numeric' };
        const date_object = new Date(Date.now());
        const date_display = date_object.toLocaleDateString("en-US", display_format_options); // provide in specified format
        const time_display = date_object.toLocaleTimeString("en-US", {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: "America/Chicago",
            timeZoneName: 'short'
        });
        const datetime_display = `${date_display} | ${time_display.slice(0, -4)}`;

        router.post(`/admin/jobs/retry/${jobId}`)
            .then(res => {
                if (!res || res.error) {
                    return setMessage({
                        msg: res?.error?.msg || 'Error occurred.',
                        type: 'error'
                    });
                }
                const job = res.response?.data
                const { status, finishedOn, processedOn } = job;
                return setMessage({msg: JSON.stringify({
                    id: jobId,
                    status: status,
                    timestamp: job?.timestamp,
                    attempts: job?.attemptsMade,
                    processedOn: processedOn ? new Date(processedOn).toLocaleString() : 'n/a',
                    finishedOn: finishedOn ? new Date(finishedOn).toLocaleString() : 'n/a',
                })});

            }).catch(err => {
                console.error('Error retrying job:', err);
                setMessage({
                    msg: err?.message || 'Error occurred.',
                    type: 'error'
                });
            }).finally(() => _refreshJobs());
    };

    /**
     * Remove a job from the queue for given ID.
     *
     * @param {string} jobId - The ID of the job to retry.
     * @returns {Promise<void>} - Resolves when the job has been retried.
     *
     * This function makes a GET request to the /admin/jobs/remove/:jobId endpoint.
     */
    const _removeJob = async (jobId) => {
        router.deletion(`/admin/jobs/remove/${jobId}`)
            .then(res => {
                if (!res || res.error) {
                    return setMessage({
                        msg: res?.error?.msg || 'Error occurred.',
                        type: 'error'
                    });
                }
                const job = res.response?.data
                const { status, finishedOn, processedOn } = job;
                return setMessage({msg: JSON.stringify({
                    id: jobId,
                    status: status,
                    timestamp: job?.timestamp,
                    attempts: job?.attemptsMade,
                    processedOn: processedOn ? new Date(processedOn).toLocaleString() : 'n/a',
                    finishedOn: finishedOn ? new Date(finishedOn).toLocaleString() : 'n/a',
                })});

            }).catch(err => {
                console.error('Error removing job:', err);
                setMessage({
                    msg: err?.message || 'Error occurred.',
                    type: 'error'
                });
            }).finally(() => _refreshJobs());
    };

    /**
     * Refresh the list of jobs in the queue.
     * Stores a list of pending job details.
     * {name: 'jobId', label: 'Job ID'}, 
        {name: 'status', label: 'Status'},
        {name: 'timestamp', label: 'Timestamp'},
        {name: 'finishedOn', label: 'Finished On'},
        {name: 'processedOn', label: 'Processed On'},
        {name: 'error', label: 'Error'},
        {name: 'data', label: 'Job Data'}
     *
     * @private
     * @return {Promise<void>} - Resolves when the jobs have been refreshed.
     */

    const _refreshJobs = async () => {
        setLoading(true);
        setMessage(null);
        router.get('/admin/jobs')
            .then(res => {

                if (!res || res.error) {
                    return setMessage({
                        msg: res?.error?.msg || 'Error occurred.',
                        type: 'error'
                    });
                }

                const counts = (res.response?.data?.counts || [])
                // set jobs
                const jobs = (res.response?.data?.jobs || []).map(job => {
                    const { jobId, status, finishedOn, processedOn } = job;
                    return {
                        id: parseInt(jobId),
                        status: status,
                        timestamp: job?.timestamp,
                        attempts: job?.attemptsMade,
                        finishedOn: finishedOn ? new Date(finishedOn).toLocaleString() : 'n/a',
                        processedOn: processedOn ? new Date(processedOn).toLocaleString() : 'n/a',
                        details: <Button icon={'info'} onClick={() => _showDetails(job)} />,
                        retry: <Button disabled={status !== 'failed'} icon={'reset'} onClick={() => _retryJob(jobId)} />,
                        remove: <Button icon={'delete'} onClick={() => _removeJob(jobId)} />,
                    }
                });
                setJobCounts(counts);
                setPendingJobs(jobs);
            }).catch(err => {
                console.error('Error fetching jobs:', err);
                setMessage({
                    msg: err?.message || 'Error occurred.',
                    type: 'error'
                });
            }).finally(() => setLoading(false));
    };

    // Utility function to convert seconds to time
    const toTime = (seconds) => {
        var date = new Date(null);
        date.setSeconds(Math.floor(seconds) || 0);
        return date.toISOString().substring(11, 8);
    }


    // check if is admin user
    useEffect(() => {
        _refreshStatus();
        if (!user || !isAdmin) {
            setMessage({
                msg: 'You do not have permission to view this page.',
                type: 'error'
            });
        }
        else {
            _refreshLogs();
            _refreshJobs();
        }
    }, [isAdmin, router, user]);

    return (
        <>
            {
                message && <UserMessage onClose={() => setMessage(null)} closeable={true} message={message} />}
            {isAdmin && <div>
                <div className="admin">
                    <Accordion
                        type="logs"
                        label="System Status"
                        open={true}
                        menu={
                            <Button icon={'sync'} onClick={() => _refreshStatus()} />
                        }
                    >
                        <>{loading && <Loading label={'Refreshing Status...'} overlay={false} />}</>
                        {!loading &&
                            <div className="h-menu">
                                <ul>
                                    <li><Badge
                                        label={`
                                    API Server: ${systemStatus?.server?.status ? 'Online' : 'Offline'}
                                `}
                                        icon={systemStatus?.server?.status ? 'success' : 'error'}
                                        size="lg"
                                        className={systemStatus?.server?.status ? 'success' : 'error'} />
                                    </li>
                                    <li><Badge
                                        label={`Database: ${systemStatus?.database?.status ? 'Online' : 'Offline'}`}
                                        icon={systemStatus?.database?.status ? 'success' : 'error'}
                                        size="lg"
                                        className={systemStatus?.database?.status ? 'success' : 'error'} />
                                    </li>
                                    <li><Badge
                                        label={`File Queue: ${systemStatus?.queue?.status ? 'Online' : 'Offline'}`}
                                        icon={systemStatus?.queue?.status ? 'success' : 'error'}
                                        size="lg"
                                        className={systemStatus?.queue?.status ? 'success' : 'error'} />
                                    </li>
                                    {/* <li><Badge
                                        label={`Auth Server: ${systemStatus?.idp?.status ? 'Online' : 'Offline'}`}
                                        icon={systemStatus?.idp?.status ? 'success' : 'error'}
                                        size="lg"
                                        className={systemStatus?.idp?.status ? 'success' : 'error'} />
                                    </li> */}
                                </ul>
                            </div>
                        }
                    </Accordion>
                </div>

                <div className="admin">

                    <Accordion
                        type="logs"
                        label="Application Logs"
                        menu={
                            <Button icon={'sync'} onClick={() => _refreshLogs()} />
                        }
                    >
                        <>{loading && <Loading label={'Loading logs...'} overlay={false} />}</>
                        {applicationLogs.length === 0 ? (
                            <div>No logs to report.</div>
                        ) : (
                            (applicationLogs || []).map((log, index) =>
                                <Accordion type="logs" key={index} label={log?.file}>
                                    {log?.contents.map((line, index) =>
                                        <div key={index}><code style={{ whiteSpace: 'pre-wrap' }}>{line}</code></div>)}
                                </Accordion>
                            ))}
                    </Accordion>

                    <Accordion
                        type="jobs"
                        label="File Processing Jobs in Queue"
                        menu={
                            <Button icon={'sync'} onClick={() => _refreshJobs()} />
                        }
                    >
                        <div className="h-menu">
                            <ul>
                                {jobCounts['completed'] > 0 && (
                                    <li>
                                        <Badge label={`Completed: ${jobCounts['completed']}`} icon={'success'} size="lg" className="success" />
                                    </li>
                                )}
                                {jobCounts['active'] > 0 && (
                                    <li>
                                        <Badge label={`Active: ${jobCounts['active']}`} icon={'sync'} size="lg" className="info" />
                                    </li>
                                )}
                                {jobCounts['delayed'] > 0 && (
                                    <li>
                                        <Badge label={`Delayed: ${jobCounts['delayed']}`} icon={'warning'} size="lg" className="info" />
                                    </li>
                                )}
                                {jobCounts['waiting'] > 0 && (
                                    <li>
                                        <Badge label={`Waiting: ${jobCounts['waiting']}`} icon={'warning'} size="lg" className="info" />
                                    </li>
                                )}
                                {jobCounts['failed'] > 0 && (
                                    <li>
                                        <Badge label={`Failed: ${jobCounts['failed']}`} icon={'error'} size="lg" className="error" />
                                    </li>
                                )}
                            </ul>
                        </div>
                        <>{loading && <Loading label={'Loading jobs...'} overlay={false} />}</>
                        {pendingJobs.length === 0 ? (
                            <div>No jobs in queue.</div>
                        ) : (
                            <Table className="files" defaultSortBy="id" rows={pendingJobs} cols={[
                                { name: 'id', label: 'Job ID' },
                                { name: 'status', label: 'Status' },
                                { name: 'timestamp', label: 'Timestamp', datatype: 'timestamp' },
                                { name: 'attempts', label: 'Retries' },
                                { name: 'processedOn', label: 'Processed', datatype: 'timestamp', defaultSort: true },
                                { name: 'finishedOn', label: 'Finished', datatype: 'timestamp' },
                                { name: 'details', label: 'Details' },
                                { name: 'retry', label: 'Retry' },
                                { name: 'remove', label: 'Remove' },
                            ]} />
                        )}
                    </Accordion>
                </div>
            </div>
            }
        </>
    );
};

export default memo(AdminView);