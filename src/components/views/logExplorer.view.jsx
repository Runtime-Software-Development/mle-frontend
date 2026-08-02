/*!
 * MLE.Client.Components.Views.LogExplorer
 * File: logExplorer.view.jsx
 * Copyright (c) 2026 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import { UserMessage } from '../common/message';
import {
    fetchAdminLogSegment,
    parseLogLine,
} from '../../services/admin.logs.client';

const INITIAL_TAIL_LINES = 1200;
const OLDER_CHUNK_LINES = 1200;
const VIRTUAL_LINE_HEIGHT = 22;
const VIRTUAL_OVERSCAN = 14;
const AUTO_REFRESH_MS = 12000;
const AUTO_LOAD_TOP_THRESHOLD_PX = 64;

const defaultLogError = { msg: '', type: 'error' };

const getDateMs = (value = '') => {
    const ts = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(ts) ? ts : null;
};

const getSeverityClass = (severity = '') => {
    const level = String(severity || '').toUpperCase();
    if (level === 'ERROR' || level === 'FATAL') return 'log-level-error';
    if (level === 'WARN' || level === 'WARNING') return 'log-level-warn';
    if (level === 'INFO') return 'log-level-info';
    if (level === 'DEBUG' || level === 'TRACE') return 'log-level-debug';
    return '';
};

const escapeRegExp = (value = '') => {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const renderHighlightedLine = (row) => {
    const text = row?.text || '';
    const timestamp = row?.timestamp;
    const severity = row?.severity;

    let rendered = text;
    let timestampStart = -1;
    let timestampEnd = -1;

    if (timestamp) {
        timestampStart = text.indexOf(timestamp);
        timestampEnd = timestampStart + timestamp.length;
    }

    if (!severity && !timestamp) {
        return rendered;
    }

    const parts = [];
    let cursor = 0;

    if (timestamp && timestampStart >= 0) {
        if (timestampStart > cursor) {
            parts.push(<span key={'plain_ts_left'}>{text.slice(cursor, timestampStart)}</span>);
        }
        parts.push(<span key={'line_ts'} className={'log-line-timestamp'}>{timestamp}</span>);
        cursor = timestampEnd;
    }

    const remaining = text.slice(cursor);
    if (!severity) {
        if (remaining) {
            parts.push(<span key={'plain_rest'}>{remaining}</span>);
        }
        return parts;
    }

    const severityRegex = new RegExp(`\\b${escapeRegExp(severity)}\\b`, 'i');
    const severityMatch = remaining.match(severityRegex);

    if (!severityMatch) {
        parts.push(<span key={'plain_post_ts'}>{remaining}</span>);
        return parts;
    }

    const severityIndex = remaining.toLowerCase().indexOf(severityMatch[0].toLowerCase());
    if (severityIndex > 0) {
        parts.push(<span key={'plain_before_sev'}>{remaining.slice(0, severityIndex)}</span>);
    }

    parts.push(
        <span key={'line_severity'} className={`log-line-severity ${getSeverityClass(severity)}`}>
            {severityMatch[0]}
        </span>
    );

    const after = remaining.slice(severityIndex + severityMatch[0].length);
    if (after) {
        parts.push(<span key={'plain_after_sev'}>{after}</span>);
    }

    return parts;
};

const LogExplorer = ({ router, refreshToken = 0 }) => {
    const [source, setSource] = React.useState('api');
    const [selectedLogFile, setSelectedLogFile] = React.useState('');
    const [fileOptions, setFileOptions] = React.useState([]);
    const [podFilter, setPodFilter] = React.useState('');
    const [podOptions, setPodOptions] = React.useState([]);

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(defaultLogError);

    const [allLines, setAllLines] = React.useState([]);
    const [loadedLines, setLoadedLines] = React.useState([]);
    const [oldestLoadedIndex, setOldestLoadedIndex] = React.useState(0);
    const [lineNumberBase, setLineNumberBase] = React.useState(1);
    const [hasMoreOlder, setHasMoreOlder] = React.useState(false);

    const [mode, setMode] = React.useState('full');
    const [nextOffset, setNextOffset] = React.useState(null);
    const [selectedFile, setSelectedFile] = React.useState('');
    const [lastUpdated, setLastUpdated] = React.useState('');
    const [lineCountReturned, setLineCountReturned] = React.useState(0);
    const [queueAvailable, setQueueAvailable] = React.useState(null);

    const [search, setSearch] = React.useState('');
    const [timeStart, setTimeStart] = React.useState('');
    const [timeEnd, setTimeEnd] = React.useState('');
    const [newestFirst, setNewestFirst] = React.useState(true);
    const [autoRefresh, setAutoRefresh] = React.useState(false);

    const [scrollTop, setScrollTop] = React.useState(0);
    const [containerHeight, setContainerHeight] = React.useState(460);

    const listRef = React.useRef(null);
    const loadingOlderRef = React.useRef(false);

    const setQueueUnavailableError = React.useCallback(() => {
        setError({ msg: 'Queue logs unavailable for current environment.', type: 'warning' });
    }, []);

    const updateMetadata = React.useCallback((segment) => {
        setLastUpdated(new Date().toLocaleString());
        setLineCountReturned(Array.isArray(segment?.lines) ? segment.lines.length : 0);
    }, []);

    const applyFullMode = React.useCallback((segment) => {
        const lines = segment.lines || [];
        const end = lines.length;
        const start = Math.max(0, end - INITIAL_TAIL_LINES);
        const initialLines = lines.slice(start, end);

        setMode('full');
        setAllLines(lines);
        setLoadedLines(initialLines);
        setOldestLoadedIndex(start);
        setLineNumberBase(start + 1);
        setHasMoreOlder(start > 0);
        setNextOffset(null);
    }, []);

    const applyPagedMode = React.useCallback((segment) => {
        const lines = segment.lines || [];

        setMode('paged');
        setAllLines([]);
        setLoadedLines(lines);
        setOldestLoadedIndex(0);
        setLineNumberBase(Number.isFinite(Number(segment.offset)) ? Number(segment.offset) + 1 : 1);
        setHasMoreOlder(!!segment.hasMore);
        setNextOffset(Number.isFinite(Number(segment.nextOffset)) ? Number(segment.nextOffset) : null);
    }, []);

    const loadInitial = React.useCallback(async () => {
        setLoading(true);
        setError(defaultLogError);

        try {
            const segment = await fetchAdminLogSegment({
                router,
                source,
                fileName: selectedLogFile,
                limit: INITIAL_TAIL_LINES,
                podFilter,
            });

            setSelectedFile(segment.selectedFile || '');
            setPodOptions(Array.isArray(segment.pods) ? segment.pods : []);
            setFileOptions(Array.isArray(segment.inventory) ? segment.inventory : []);
            if (segment.selectedFile && segment.selectedFile !== selectedLogFile) {
                setSelectedLogFile(segment.selectedFile);
            }
            updateMetadata(segment);

            if (!segment.sourceAvailable && source === 'queue') {
                setQueueAvailable(false);
                setQueueUnavailableError();
                setAllLines([]);
                setLoadedLines([]);
                setHasMoreOlder(false);
                return;
            }

            if (source === 'queue') {
                setQueueAvailable(true);
            }

            if (!segment.fileAvailable) {
                setError({ msg: `Selected log file is not available for ${source.toUpperCase()}.`, type: 'warning' });
                setAllLines([]);
                setLoadedLines([]);
                setHasMoreOlder(false);
                return;
            }

            if (segment.mode === 'paged') {
                applyPagedMode(segment);
            } else {
                applyFullMode(segment);
            }
        } catch (err) {
            if (source === 'queue') {
                setQueueAvailable(false);
                setQueueUnavailableError();
            } else {
                setError({ msg: err?.message || 'Unable to load logs.', type: 'error' });
            }
            setAllLines([]);
            setLoadedLines([]);
            setHasMoreOlder(false);
        } finally {
            setLoading(false);
        }
    }, [router, source, selectedLogFile, podFilter, applyFullMode, applyPagedMode, setQueueUnavailableError, updateMetadata]);

    const refreshLatest = React.useCallback(async () => {
        try {
            const segment = await fetchAdminLogSegment({
                router,
                source,
                fileName: selectedLogFile,
                limit: INITIAL_TAIL_LINES,
                podFilter,
            });

            setSelectedFile(segment.selectedFile || '');
            setFileOptions(Array.isArray(segment.inventory) ? segment.inventory : []);
            if (segment.selectedFile && segment.selectedFile !== selectedLogFile) {
                setSelectedLogFile(segment.selectedFile);
            }
            updateMetadata(segment);

            if (source === 'queue') {
                setQueueAvailable(true);
            }

            if (segment.mode === 'paged') {
                // Without a stable token/offset contract, safest refresh is a lightweight replace.
                setLoadedLines(segment.lines || []);
                setLineNumberBase(Number.isFinite(Number(segment.offset)) ? Number(segment.offset) + 1 : 1);
                setHasMoreOlder(!!segment.hasMore);
                setNextOffset(Number.isFinite(Number(segment.nextOffset)) ? Number(segment.nextOffset) : null);
                setMode('paged');
                return;
            }

            const latestLines = segment.lines || [];
            setMode('full');
            setAllLines(latestLines);

            setLoadedLines(existing => {
                const existingLength = existing.length;
                const currentStart = Math.max(0, oldestLoadedIndex);
                const latestFromCurrentStart = latestLines.slice(currentStart);

                if (latestFromCurrentStart.length >= existingLength) {
                    return latestFromCurrentStart;
                }

                return existing;
            });

            setHasMoreOlder(Math.max(0, oldestLoadedIndex) > 0);
        } catch (err) {
            if (source === 'queue') {
                setQueueAvailable(false);
                setQueueUnavailableError();
            } else {
                setError({ msg: err?.message || 'Unable to refresh logs.', type: 'warning' });
            }
        }
    }, [router, source, selectedLogFile, podFilter, oldestLoadedIndex, setQueueUnavailableError, updateMetadata]);

    const loadOlder = React.useCallback(async (reason = 'manual') => {
        if (!hasMoreOlder) return;
        if (loadingOlderRef.current) return;

        loadingOlderRef.current = true;

        const container = listRef.current;
        const previousScrollHeight = container?.scrollHeight || 0;
        const previousScrollTop = container?.scrollTop || 0;

        try {
            if (mode === 'full') {
                const nextStart = Math.max(0, oldestLoadedIndex - OLDER_CHUNK_LINES);
                const olderChunk = allLines.slice(nextStart, oldestLoadedIndex);

                setLoadedLines(data => [...olderChunk, ...data]);
                setOldestLoadedIndex(nextStart);
                setLineNumberBase(nextStart + 1);
                setHasMoreOlder(nextStart > 0);
            }

            if (mode === 'paged' && Number.isFinite(Number(nextOffset))) {
                try {
                    setLoading(true);
                    const segment = await fetchAdminLogSegment({
                        router,
                        source,
                        fileName: selectedLogFile,
                        offset: Number(nextOffset),
                        limit: OLDER_CHUNK_LINES,
                        podFilter,
                    });

                    const chunk = segment.lines || [];
                    setLoadedLines(data => [...chunk, ...data]);
                    setLineNumberBase(Number.isFinite(Number(segment.offset)) ? Number(segment.offset) + 1 : lineNumberBase);
                    setHasMoreOlder(!!segment.hasMore);
                    setNextOffset(Number.isFinite(Number(segment.nextOffset)) ? Number(segment.nextOffset) : null);
                    updateMetadata(segment);
                } catch (err) {
                    setError({ msg: err?.message || 'Unable to load older log lines.', type: 'warning' });
                } finally {
                    setLoading(false);
                }
            }
        } finally {
            loadingOlderRef.current = false;

            // Preserve user viewport when older lines are prepended.
            if (reason === 'scroll') {
                requestAnimationFrame(() => {
                    const nextContainer = listRef.current;
                    if (!nextContainer) return;
                    const nextScrollHeight = nextContainer.scrollHeight || 0;
                    const growth = Math.max(0, nextScrollHeight - previousScrollHeight);
                    const nextTop = previousScrollTop + growth;
                    nextContainer.scrollTop = nextTop;
                    setScrollTop(nextTop);
                });
            }
        }
    }, [hasMoreOlder, mode, oldestLoadedIndex, allLines, nextOffset, router, source, selectedLogFile, podFilter, lineNumberBase, updateMetadata]);

    React.useEffect(() => {
        loadInitial();
    }, [loadInitial, refreshToken]);

    React.useEffect(() => {
        if (!autoRefresh) return;

        const timer = setInterval(() => {
            refreshLatest();
        }, AUTO_REFRESH_MS);

        return () => clearInterval(timer);
    }, [autoRefresh, refreshLatest]);

    React.useEffect(() => {
        const observer = new ResizeObserver(() => {
            if (listRef.current) {
                setContainerHeight(listRef.current.clientHeight || 460);
            }
        });

        if (listRef.current) {
            observer.observe(listRef.current);
            setContainerHeight(listRef.current.clientHeight || 460);
        }

        return () => observer.disconnect();
    }, []);

    const normalizedRows = React.useMemo(() => {
        return loadedLines.map((line, index) => {
            const parsed = parseLogLine(line, lineNumberBase + index);
            const timestampMs = parsed.timestamp ? getDateMs(parsed.timestamp.replace(' ', 'T')) : null;

            return {
                ...parsed,
                source,
                pod: podFilter || 'all',
                fileType: selectedFile || selectedLogFile || 'unknown',
                line: parsed.text,
                timestampMs,
            };
        });
    }, [loadedLines, lineNumberBase, source, podFilter, selectedFile, selectedLogFile]);

    const filteredRows = React.useMemo(() => {
        const term = String(search || '').trim().toLowerCase();
        const startMs = getDateMs(timeStart);
        const endMs = getDateMs(timeEnd);

        return normalizedRows
            .filter(row => !term || row.text.toLowerCase().includes(term))
            .filter(row => {
                if (startMs === null && endMs === null) return true;
                if (!Number.isFinite(row.timestampMs)) return false;
                if (startMs !== null && row.timestampMs < startMs) return false;
                if (endMs !== null && row.timestampMs > endMs) return false;
                return true;
            });
    }, [normalizedRows, search, timeStart, timeEnd]);

    const orderedRows = React.useMemo(() => {
        return newestFirst ? [...filteredRows].reverse() : filteredRows;
    }, [filteredRows, newestFirst]);

    const totalRows = orderedRows.length;
    const visibleCount = Math.ceil((containerHeight || 460) / VIRTUAL_LINE_HEIGHT) + VIRTUAL_OVERSCAN;
    const startIndex = Math.max(0, Math.floor(scrollTop / VIRTUAL_LINE_HEIGHT) - VIRTUAL_OVERSCAN);
    const endIndex = Math.min(totalRows, startIndex + visibleCount);
    const rowsWindow = orderedRows.slice(startIndex, endIndex);
    const topSpacer = startIndex * VIRTUAL_LINE_HEIGHT;
    const bottomSpacer = Math.max(0, (totalRows - endIndex) * VIRTUAL_LINE_HEIGHT);

    React.useEffect(() => {
        if (loading) return;
        if (!hasMoreOlder) return;
        if (scrollTop > AUTO_LOAD_TOP_THRESHOLD_PX) return;
        if (totalRows === 0) return;

        loadOlder('scroll');
    }, [scrollTop, hasMoreOlder, loading, totalRows, loadOlder]);

    return (
        <div className={'log-explorer'}>
            {error?.msg && (
                <UserMessage
                    closeable={true}
                    onClose={() => setError(defaultLogError)}
                    message={error}
                />
            )}

            <div className={'log-explorer-controls'}>
                <div className={'h-menu log-explorer-controls-row'}>
                    <ul>
                        <li className={'log-explorer-field'}>
                            <label htmlFor={'log_source'}>Source</label>
                            <select
                                id={'log_source'}
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                            >
                                <option value={'api'}>API Logs</option>
                                <option value={'queue'} disabled={queueAvailable === false}>Queue Logs{queueAvailable === false ? ' (Unavailable)' : ''}</option>
                            </select>
                        </li>
                        <li className={'log-explorer-field'}>
                            <label htmlFor={'log_file'}>Log File</label>
                            <select
                                id={'log_file'}
                                value={selectedLogFile}
                                onChange={(e) => setSelectedLogFile(e.target.value)}
                                disabled={fileOptions.length === 0}
                            >
                                {
                                    fileOptions.length === 0
                                        ? <option value={''}>No files discovered</option>
                                        : fileOptions.map((item) => {
                                            const label = `${item.filename} (${String(item.source || source).toUpperCase()})`;
                                            return <option key={`log_file_opt_${item.file}`} value={item.file}>{label}</option>;
                                        })
                                }
                            </select>
                        </li>
                        <li className={'log-explorer-field'}>
                            <label htmlFor={'log_pod'}>Pod / Subdirectory</label>
                            <select
                                id={'log_pod'}
                                value={podFilter}
                                onChange={(e) => setPodFilter(e.target.value)}
                                disabled={podOptions.length === 0}
                            >
                                <option value={''}>All</option>
                                {podOptions.map(option => (
                                    <option key={`pod_opt_${option}`} value={option}>{option}</option>
                                ))}
                            </select>
                        </li>
                        <li className={'log-explorer-actions'}>
                            <Button icon={'sync'} label={'Refresh'} onClick={refreshLatest} />
                            <Button icon={'down'} label={'Load Newer'} onClick={refreshLatest} />
                            <Button
                                icon={'up'}
                                label={'Load Older'}
                                disabled={!hasMoreOlder}
                                onClick={() => loadOlder('manual')}
                            />
                        </li>
                    </ul>
                </div>

                <div className={'h-menu log-explorer-controls-row'}>
                    <ul>
                        <li className={'log-explorer-field log-explorer-search'}>
                            <label htmlFor={'log_search'}>Search Loaded Lines</label>
                            <input
                                id={'log_search'}
                                type={'text'}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={'Filter currently loaded lines'}
                            />
                        </li>
                        <li className={'log-explorer-field'}>
                            <label htmlFor={'log_time_start'}>Start Time</label>
                            <input
                                id={'log_time_start'}
                                type={'datetime-local'}
                                value={timeStart}
                                onChange={(e) => setTimeStart(e.target.value)}
                            />
                        </li>
                        <li className={'log-explorer-field'}>
                            <label htmlFor={'log_time_end'}>End Time</label>
                            <input
                                id={'log_time_end'}
                                type={'datetime-local'}
                                value={timeEnd}
                                onChange={(e) => setTimeEnd(e.target.value)}
                            />
                        </li>
                        <li className={'log-explorer-autorefresh'}>
                            <label htmlFor={'log_newest_first'}>
                                <input
                                    id={'log_newest_first'}
                                    type={'checkbox'}
                                    checked={newestFirst}
                                    onChange={(e) => setNewestFirst(!!e.target.checked)}
                                />
                                Newest first
                            </label>
                        </li>
                        <li className={'log-explorer-autorefresh'}>
                            <label htmlFor={'log_auto_refresh'}>
                                <input
                                    id={'log_auto_refresh'}
                                    type={'checkbox'}
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(!!e.target.checked)}
                                />
                                Auto-refresh (12s)
                            </label>
                        </li>
                        <li className={'log-explorer-meta'}>
                            <span>{totalRows} visible lines</span>
                            <span>Source: {source.toUpperCase()}</span>
                            <span>Pod: {podFilter || 'All'}</span>
                            {selectedFile && <span>File: {selectedFile}</span>}
                            <span>Returned: {lineCountReturned}</span>
                            <span>Updated: {lastUpdated || 'n/a'}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div
                ref={listRef}
                className={'log-virtual-list'}
                onScroll={(e) => setScrollTop(e.target.scrollTop)}
            >
                {loading && <div className={'log-loading'}>Loading logs...</div>}
                {!loading && totalRows === 0 && !error?.msg && (
                    <div className={'log-empty'}>
                        {source === 'queue'
                            ? 'Queue logs unavailable for current environment.'
                            : 'No log lines found for the current selection.'}
                    </div>
                )}
                {!loading && totalRows > 0 && (
                    <div className={'log-lines'} style={{ height: `${totalRows * VIRTUAL_LINE_HEIGHT}px` }}>
                        <div style={{ height: `${topSpacer}px` }} />
                        {rowsWindow.map((row, idx) => {
                            const key = `log_line_${row.lineNumber}_${startIndex + idx}`;
                            return (
                                <div className={'log-line'} key={key} style={{ height: `${VIRTUAL_LINE_HEIGHT}px` }}>
                                    <span className={'log-line-number'}>{row.lineNumber}</span>
                                    <span className={'log-line-text'}>{renderHighlightedLine(row)}</span>
                                </div>
                            );
                        })}
                        <div style={{ height: `${bottomSpacer}px` }} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogExplorer;
