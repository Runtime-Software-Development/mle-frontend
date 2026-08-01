/*!
 * MLE.Client.Components.Views.Admin
 * File: admin.view.js
 * Copyright (c) 2025 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

import { useEffect, useState, memo, useMemo } from 'react';
import { UserMessage } from "../common/message";
import { useUser } from "../../providers/user.provider.client";
import { useRouter } from "../../providers/router.provider.client";
import Accordion from '../common/accordion';
import Table from '../common/table';
import Button from '../common/button';
import Loading from '../common/loading';
import Badge from '../common/badge';
import Dialog from '../common/dialog';
import LogExplorer from './logExplorer.view';
import {
    normalizeAdminJob,
    ADMIN_JOB_STATUSES,
    getDateRangeBoundaries,
    withinDateRange,
    matchesSearchTerm,
} from '../../utils/adminJobs.utils.client';

const TRANSACTION_TIME_BUCKET_MS = 2 * 60 * 1000;

const getObjectPath = (value, path = []) => {
    let cursor = value;
    for (let i = 0; i < path.length; i++) {
        const key = path[i];
        if (!cursor || typeof cursor !== 'object' || !(key in cursor)) {
            return null;
        }
        cursor = cursor[key];
    }

    return cursor;
};

const pickTransactionKey = (job) => {
    const payload = job?.parsedPayload && typeof job.parsedPayload === 'object'
        ? job.parsedPayload
        : {};

    const file = payload?.file && typeof payload.file === 'object' ? payload.file : {};

    const candidates = [
        payload.transactionId,
        payload.transaction_id,
        payload.uploadId,
        payload.upload_id,
        payload.fileId,
        payload.file_id,
        file.id,
        file.file_id,
        file.uuid,
        file.hash,
        file.filename_tmp,
        file.fs_path,
        getObjectPath(payload, ['source', 'fileId']),
        getObjectPath(payload, ['source', 'uploadId']),
        job.uploadPath,
        job.tempFilePath,
    ]
        .filter(value => value !== null && typeof value !== 'undefined')
        .map(value => String(value).trim())
        .filter(Boolean);

    if (candidates.length > 0) {
        return `id:${candidates[0]}`;
    }

    const ownerPart = job.ownerId || 'unknown-owner';
    const filePart = job.filename || 'unknown-file';
    const bucket = Math.floor((job.sortTimestampMs || 0) / TRANSACTION_TIME_BUCKET_MS);
    return `fallback:${ownerPart}:${filePart}:${bucket}`;
};

const summarizeTransactionStatus = (jobs = []) => {
    const statuses = jobs.map(job => job.status);
    if (statuses.includes('failed')) return 'failed';
    if (statuses.includes('active')) return 'active';
    if (statuses.includes('delayed')) return 'delayed';
    if (statuses.includes('waiting')) return 'waiting';
    if (statuses.includes('completed')) return 'completed';
    return 'unknown';
};

const pickPrimaryJob = (jobs = []) => {
    const processMatch = jobs.find(job => String(job.processType || '').toLowerCase().includes('upload'));
    if (processMatch) return processMatch;

    const withFilename = jobs.find(job => !!job.filename);
    if (withFilename) return withFilename;

    return jobs[0] || null;
};

/**
 * Render admin panel component (super-administrator users).
 *
 * @public
 * @returns {JSX.Element} result
 */
const AdminView = () => {
    const user = useUser();
    const router = useRouter();

    const [message, setMessage] = useState(null);
    const [rawJobs, setRawJobs] = useState([]);
    const [jobCounts, setJobCounts] = useState([]);
    const [logsRefreshToken, setLogsRefreshToken] = useState(0);
    const [systemStatus, setSystemStatus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [jobStatusFilters, setJobStatusFilters] = useState(
        ADMIN_JOB_STATUSES.reduce((acc, status) => ({ ...acc, [status]: true }), {})
    );
    const [jobDateRange, setJobDateRange] = useState('30d');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [jobSearch, setJobSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(100);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

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

    const _showTransactionDetails = (transaction) => {
        setSelectedTransaction(transaction);
    };

    const _retryTransaction = async (transaction) => {
        const jobs = Array.isArray(transaction?.jobs) ? transaction.jobs : [];
        if (jobs.length === 0) {
            return;
        }

        const results = await Promise.allSettled(
            jobs.map(job => router.post(`/admin/jobs/retry/${job.jobId}`))
        );

        const successCount = results.filter(item => item.status === 'fulfilled').length;
        const failureCount = jobs.length - successCount;

        if (failureCount > 0) {
            setMessage({
                msg: `Retried ${successCount}/${jobs.length} jobs in transaction. ${failureCount} failed to enqueue.`,
                type: 'warning'
            });
        } else {
            setMessage({
                msg: `Retried ${successCount}/${jobs.length} jobs in transaction.`,
                type: 'success'
            });
        }

        _refreshJobs();
    };

    const _removeTransaction = async (transaction) => {
        const jobs = Array.isArray(transaction?.jobs) ? transaction.jobs : [];
        if (jobs.length === 0) {
            return;
        }

        const results = await Promise.allSettled(
            jobs.map(job => router.deletion(`/admin/jobs/remove/${job.jobId}`))
        );

        const successCount = results.filter(item => item.status === 'fulfilled').length;
        const failureCount = jobs.length - successCount;

        if (failureCount > 0) {
            setMessage({
                msg: `Removed ${successCount}/${jobs.length} jobs in transaction. ${failureCount} failed to remove.`,
                type: 'warning'
            });
        } else {
            setMessage({
                msg: `Removed ${successCount}/${jobs.length} jobs in transaction.`,
                type: 'success'
            });
        }

        _refreshJobs();
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
                const jobs = (res.response?.data?.jobs || []);
                setJobCounts(counts);
                setRawJobs(jobs);
            }).catch(err => {
                console.error('Error fetching jobs:', err);
                setMessage({
                    msg: err?.message || 'Error occurred.',
                    type: 'error'
                });
            }).finally(() => setLoading(false));
    };

    const normalizedJobs = useMemo(() => {
        return (rawJobs || []).map(job => normalizeAdminJob(job));
    }, [rawJobs]);

    const parseFailureCount = useMemo(() => {
        return normalizedJobs.filter(job => job.parseError).length;
    }, [normalizedJobs]);

    const filteredJobs = useMemo(() => {
        const selectedStatuses = Object.keys(jobStatusFilters || {}).filter(status => jobStatusFilters[status]);
        const { startMs, endMs } = getDateRangeBoundaries(jobDateRange, customStartDate, customEndDate);

        return normalizedJobs
            .filter(job => selectedStatuses.length === 0 || selectedStatuses.includes(job.status))
            .filter(job => withinDateRange(job, startMs, endMs))
            .filter(job => matchesSearchTerm(job, jobSearch))
            .sort((a, b) => b.sortTimestampMs - a.sortTimestampMs);
    }, [normalizedJobs, jobStatusFilters, jobDateRange, customStartDate, customEndDate, jobSearch]);

    const groupedTransactions = useMemo(() => {
        const byTransaction = new Map();

        filteredJobs.forEach(job => {
            const transactionKey = pickTransactionKey(job);
            if (!byTransaction.has(transactionKey)) {
                byTransaction.set(transactionKey, {
                    transactionKey,
                    jobs: [],
                });
            }

            byTransaction.get(transactionKey).jobs.push(job);
        });

        return Array.from(byTransaction.values())
            .map(group => {
                const jobs = [...group.jobs].sort((a, b) => b.sortTimestampMs - a.sortTimestampMs);
                const primaryJob = pickPrimaryJob(jobs);
                const processTypes = Array.from(new Set(
                    jobs
                        .map(job => job.processType)
                        .filter(Boolean)
                        .map(type => String(type))
                ));

                return {
                    ...group,
                    jobs,
                    primaryJob,
                    latestTimestampMs: jobs[0]?.sortTimestampMs || 0,
                    latestTimestampDisplay: jobs[0]?.timestampDisplay || 'n/a',
                    status: summarizeTransactionStatus(jobs),
                    filename: primaryJob?.filename || jobs[0]?.filename || 'Unknown file',
                    ownerId: primaryJob?.ownerId || jobs[0]?.ownerId || 'n/a',
                    processTypes,
                };
            })
            .sort((a, b) => b.latestTimestampMs - a.latestTimestampMs);
    }, [filteredJobs]);

    const totalPages = useMemo(() => {
        const pages = Math.ceil(groupedTransactions.length / pageSize);
        return pages > 0 ? pages : 1;
    }, [groupedTransactions.length, pageSize]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const pagedTransactions = useMemo(() => {
        const startIndex = (page - 1) * pageSize;
        return groupedTransactions.slice(startIndex, startIndex + pageSize);
    }, [groupedTransactions, page, pageSize]);

    const tableRows = useMemo(() => {
        return pagedTransactions.map((transaction) => {
            const transactionLabel = `${transaction.filename} (${transaction.jobs.length} job${transaction.jobs.length > 1 ? 's' : ''})`;
            const processTypeSummary = transaction.processTypes.length > 0
                ? transaction.processTypes.join(', ')
                : 'n/a';

            return {
                className: 'admin-job-row-transaction',
                transaction: transactionLabel,
                id: transaction.jobs.map(job => job.jobId).join(', '),
                processType: processTypeSummary,
                status: transaction.status,
                timestamp: transaction.latestTimestampDisplay,
                details: <Button icon={'info'} onClick={() => _showTransactionDetails(transaction)} />,
                retry: <Button icon={'reset'} onClick={() => _retryTransaction(transaction)} />,
                remove: <Button icon={'delete'} onClick={() => _removeTransaction(transaction)} />,
            };
        });
    }, [pagedTransactions, router]);

    const _setStatusFilter = (status, checked) => {
        setJobStatusFilters(data => ({ ...data, [status]: !!checked }));
        setPage(1);
    };

    const _clearJobFilters = () => {
        setJobStatusFilters(ADMIN_JOB_STATUSES.reduce((acc, status) => ({ ...acc, [status]: true }), {}));
        setJobDateRange('30d');
        setCustomStartDate('');
        setCustomEndDate('');
        setJobSearch('');
        setPage(1);
    };

    const _formatDetailValue = (value) => {
        if (value === null || typeof value === 'undefined' || value === '') return 'Not available';
        if (typeof value === 'string') return value;
        return JSON.stringify(value, null, 2);
    };

    const _setDateRange = (value) => {
        setJobDateRange(value);
        setPage(1);
    };


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
                            <Button icon={'sync'} onClick={() => setLogsRefreshToken(t => t + 1)} />
                        }
                    >
                        <LogExplorer
                            router={router}
                            refreshToken={logsRefreshToken}
                        />
                    </Accordion>

                    <Accordion
                        type="jobs"
                        label="File Processing Jobs History"
                        menu={
                            <Button icon={'sync'} onClick={() => _refreshJobs()} />
                        }
                    >
                        <div className="h-menu admin-job-status-badges">
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
                        {
                            parseFailureCount > 0 &&
                            <UserMessage
                                closeable={false}
                                message={{
                                    msg: `${parseFailureCount} job payload(s) could not be parsed. Showing legacy fields only for those rows.`,
                                    type: 'warning'
                                }}
                            />
                        }
                        <div className={'admin-job-filters'}>
                            <div className={'h-menu admin-job-filter-row'}>
                                <ul>
                                    <li className={'admin-job-field'}>
                                        <label htmlFor={'admin-job-search'}>Search</label>
                                        <input
                                            id={'admin-job-search'}
                                            type={'text'}
                                            placeholder={'Job ID, filename, owner ID, process type'}
                                            value={jobSearch}
                                            onChange={(e) => {
                                                setJobSearch(e.target.value);
                                                setPage(1);
                                            }}
                                        />
                                    </li>
                                    <li className={'admin-job-field admin-job-field-date'}>
                                        <label htmlFor={'admin-job-range'}>Date Range</label>
                                        <select
                                            id={'admin-job-range'}
                                            value={jobDateRange}
                                            onChange={(e) => _setDateRange(e.target.value)}
                                        >
                                            <option value={'24h'}>Last 24h</option>
                                            <option value={'7d'}>Last 7d</option>
                                            <option value={'30d'}>Last 30d</option>
                                            <option value={'custom'}>Custom</option>
                                        </select>
                                    </li>
                                    {
                                        jobDateRange === 'custom' &&
                                        <>
                                            <li className={'admin-job-field'}>
                                                <label htmlFor={'admin-job-date-start'}>Start</label>
                                                <input
                                                    id={'admin-job-date-start'}
                                                    type={'date'}
                                                    value={customStartDate}
                                                    onChange={(e) => {
                                                        setCustomStartDate(e.target.value);
                                                        setPage(1);
                                                    }}
                                                />
                                            </li>
                                            <li className={'admin-job-field'}>
                                                <label htmlFor={'admin-job-date-end'}>End</label>
                                                <input
                                                    id={'admin-job-date-end'}
                                                    type={'date'}
                                                    value={customEndDate}
                                                    onChange={(e) => {
                                                        setCustomEndDate(e.target.value);
                                                        setPage(1);
                                                    }}
                                                />
                                            </li>
                                        </>
                                    }
                                    <li className={'admin-job-filter-actions'}>
                                        <Button icon={'cancel'} label={'Clear Filters'} onClick={_clearJobFilters} />
                                    </li>
                                </ul>
                            </div>
                            <div className={'h-menu admin-job-status-row'}>
                                <ul>
                                    {
                                        ADMIN_JOB_STATUSES.map(status => {
                                            return <li key={`job_status_filter_${status}`}>
                                                <label htmlFor={`filter_${status}`}>
                                                    <input
                                                        id={`filter_${status}`}
                                                        type={'checkbox'}
                                                        checked={!!jobStatusFilters[status]}
                                                        onChange={(e) => _setStatusFilter(status, e.target.checked)}
                                                    />
                                                    {' '}{status}
                                                </label>
                                            </li>
                                        })
                                    }
                                </ul>
                            </div>
                            <div className={'h-menu admin-job-pagination-row'}>
                                <ul>
                                    <li>
                                        <strong>{groupedTransactions.length}</strong> matching transactions
                                    </li>
                                    <li className={'admin-job-field admin-job-page-size'}>
                                        <label htmlFor={'admin-job-page-size'}>Page Size</label>
                                        <select
                                            id={'admin-job-page-size'}
                                            value={pageSize}
                                            onChange={(e) => {
                                                setPageSize(Number(e.target.value));
                                                setPage(1);
                                            }}
                                        >
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                            <option value={250}>250</option>
                                            <option value={500}>500</option>
                                        </select>
                                    </li>
                                    <li>
                                        <Button
                                            icon={'left'}
                                            label={'Prev'}
                                            disabled={page <= 1}
                                            onClick={() => setPage(p => (p > 1 ? p - 1 : p))}
                                        />
                                    </li>
                                    <li>
                                        Page {page} of {totalPages}
                                    </li>
                                    <li>
                                        <Button
                                            icon={'right'}
                                            label={'Next'}
                                            disabled={page >= totalPages}
                                            onClick={() => setPage(p => (p < totalPages ? p + 1 : p))}
                                        />
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <>{loading && <Loading label={'Loading jobs...'} overlay={false} />}</>
                        {tableRows.length === 0 ? (
                            <div>No jobs match the current filters.</div>
                        ) : (
                            <Table className="files" rows={tableRows} cols={[
                                { name: 'transaction', label: 'Transaction' },
                                { name: 'id', label: 'Job ID' },
                                { name: 'processType', label: 'Process Type' },
                                { name: 'status', label: 'Status' },
                                { name: 'timestamp', label: 'Timestamp' },
                                { name: 'details', label: 'Details' },
                                { name: 'retry', label: 'Retry' },
                                { name: 'remove', label: 'Remove' },
                            ]} />
                        )}
                    </Accordion>
                </div>
            </div>
            }
            {
                selectedTransaction &&
                <Dialog
                    className={'admin-job-dialog top-layer'}
                    title={`Transaction Details: ${selectedTransaction.filename}`}
                    callback={() => setSelectedTransaction(null)}
                >
                    <div className={'h-menu'}>
                        <ul>
                            <li><strong>Owner:</strong> {selectedTransaction.ownerId || 'n/a'}</li>
                            <li><strong>Status:</strong> {selectedTransaction.status}</li>
                            <li><strong>Jobs:</strong> {selectedTransaction.jobs.length}</li>
                        </ul>
                    </div>

                    <div className={'h-menu'} style={{ marginBottom: '8px' }}>
                        <ul>
                            <li><Button icon={'reset'} label={'Retry Transaction'} onClick={() => _retryTransaction(selectedTransaction)} /></li>
                            <li><Button icon={'delete'} label={'Remove Transaction'} onClick={() => _removeTransaction(selectedTransaction)} /></li>
                        </ul>
                    </div>

                    <table className={'item'}>
                        <thead>
                            <tr>
                                <th>Job ID</th>
                                <th>Process Type</th>
                                <th>Status</th>
                                <th>Attempts</th>
                                <th>Timestamp</th>
                                <th>Errors</th>
                                <th>Warnings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                selectedTransaction.jobs.map((job) => {
                                    const attemptsLabel = Number.isFinite(job.attemptsMade)
                                        ? Number.isFinite(job.attemptsMax)
                                            ? `${job.attemptsMade}/${job.attemptsMax}`
                                            : `${job.attemptsMade}`
                                        : 'n/a';

                                    return <tr key={`tx_job_${job.jobId}`}>
                                        <td>{job.jobId || 'n/a'}</td>
                                        <td>{job.processType || 'n/a'}</td>
                                        <td>{job.status || 'n/a'}</td>
                                        <td>{attemptsLabel}</td>
                                        <td>{job.timestampDisplay}</td>
                                        <td>{job.errorCount || 0}</td>
                                        <td>{job.warningCount || 0}</td>
                                    </tr>;
                                })
                            }
                        </tbody>
                    </table>

                    {
                        selectedTransaction.jobs.map(job => {
                            const exif = job?.diagnostics?.metadata?.exif;
                            return <table className={'item'} key={`tx_job_detail_${job.jobId}`}>
                                <thead>
                                    <tr>
                                        <th colSpan={'2'}>Job {job.jobId} Diagnostics ({job.processType || 'n/a'})</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><th>Failed Reason</th><td>{job.failedReason || 'Not available'}</td></tr>
                                    <tr><th>Temp File Path</th><td>{job.tempFilePath || 'Not available'}</td></tr>
                                    <tr><th>Upload Path</th><td>{job.uploadPath || 'Not available'}</td></tr>
                                    <tr>
                                        <th>Errors</th>
                                        <td>{job.errors.length > 0 ? <pre>{job.errors.map(item => _formatDetailValue(item)).join('\n')}</pre> : 'Not available'}</td>
                                    </tr>
                                    <tr>
                                        <th>Warnings</th>
                                        <td>{job.warnings.length > 0 ? <pre>{job.warnings.map(item => _formatDetailValue(item)).join('\n')}</pre> : 'Not available'}</td>
                                    </tr>
                                    <tr>
                                        <th>EXIF</th>
                                        <td>{exif ? <pre>{JSON.stringify(exif, null, 2)}</pre> : 'Not available'}</td>
                                    </tr>
                                </tbody>
                            </table>;
                        })
                    }
                </Dialog>
            }
        </>
    );
};

export default memo(AdminView);