/*!
 * MLE.Client.Components.Views.LogExplorer
 * Copyright (c) 2026 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { saveAs } from 'file-saver';
import Button from '../common/button';
import { UserMessage } from '../common/message';
import { fetchAdminLogFiles, parseLogLine } from '../../services/admin.logs.client';

const PREVIEW_LINES = 1200;
const LINE_HEIGHT = 22;
const OVERSCAN = 14;
const EMPTY_LINES = [];

const fileLabel = (file) => ({
    'error.log': 'Errors',
    'access.log': 'HTTP requests',
    'queue-error.log': 'Errors',
    'queue-access.log': 'HTTP requests',
    'queue.log': 'Activity',
}[file.filename] || file.filename);

const dateMs = (value) => value ? new Date(value).getTime() : NaN;

const LogExplorer = ({ router, refreshToken = 0 }) => {
    const [source, setSource] = React.useState('api');
    const [files, setFiles] = React.useState([]);
    const [selection, setSelection] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [updated, setUpdated] = React.useState('');
    const [limit, setLimit] = React.useState(PREVIEW_LINES);
    const [search, setSearch] = React.useState('');
    const [startTime, setStartTime] = React.useState('');
    const [endTime, setEndTime] = React.useState('');
    const [newestFirst, setNewestFirst] = React.useState(true);
    const [autoRefresh, setAutoRefresh] = React.useState(false);
    const [scrollTop, setScrollTop] = React.useState(0);
    const [height, setHeight] = React.useState(460);
    const listRef = React.useRef(null);
    const requestRef = React.useRef(false);
    const routerRef = React.useRef(router);
    routerRef.current = router;

    const refresh = React.useCallback(async () => {
        if (requestRef.current) return;
        requestRef.current = true;
        setLoading(true);
        setError(null);
        try {
            const nextFiles = await fetchAdminLogFiles(routerRef.current);
            // Replace the snapshot: a refresh may be served by a different instance.
            setFiles(nextFiles);
            setUpdated(new Date().toLocaleString());
        } catch (err) {
            setError({ msg: err?.message || 'Unable to load logs.', type: 'error' });
        } finally {
            requestRef.current = false;
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        refresh();
    }, [refresh, refreshToken]);

    React.useEffect(() => {
        if (!autoRefresh) return;
        const timer = setInterval(refresh, 12000);
        return () => clearInterval(timer);
    }, [autoRefresh, refresh]);

    React.useEffect(() => {
        const observer = new ResizeObserver(() => {
            setHeight(listRef.current?.clientHeight || 460);
        });
        if (listRef.current) observer.observe(listRef.current);
        return () => observer.disconnect();
    }, []);

    const sourceFiles = files.filter(file => file.source === source && file.filename !== 'queue-log-fetch-error');
    const selected = sourceFiles.find(file => file.file === selection) || sourceFiles[0];
    const lines = selected?.contents || EMPTY_LINES;
    const queueFailure = files.find(file => file.source === 'queue' && file.filename === 'queue-log-fetch-error');
    const queueUnavailable = source === 'queue' && queueFailure;

    React.useEffect(() => {
        setLimit(PREVIEW_LINES);
        setScrollTop(0);
        if (listRef.current) listRef.current.scrollTop = 0;
    }, [source, selected?.file]);

    React.useEffect(() => {
        setScrollTop(0);
        if (listRef.current) listRef.current.scrollTop = 0;
    }, [search, startTime, endTime, newestFirst]);

    const rows = React.useMemo(() => {
        const first = Math.max(0, lines.length - limit);
        const term = search.trim().toLowerCase();
        const start = dateMs(startTime);
        const end = dateMs(endTime);
        const result = lines.slice(first).map((line, index) => parseLogLine(line, first + index + 1))
            .filter(row => {
                if (term && !row.text.toLowerCase().includes(term)) return false;
                if (!startTime && !endTime) return true;
                const timestamp = dateMs(row.timestamp?.replace(' ', 'T'));
                return Number.isFinite(timestamp) &&
                    (!startTime || timestamp >= start) && (!endTime || timestamp <= end);
            });
        return newestFirst ? result.reverse() : result;
    }, [lines, limit, search, startTime, endTime, newestFirst]);

    const firstRow = Math.min(Math.max(0, rows.length - 1), Math.max(0, Math.floor(scrollTop / LINE_HEIGHT) - OVERSCAN));
    const lastRow = Math.min(rows.length, firstRow + Math.ceil(height / LINE_HEIGHT) + OVERSCAN * 2);

    const download = () => {
        try {
            saveAs(new Blob([lines.join('\n') + (lines.length ? '\n' : '')], { type: 'text/plain;charset=utf-8' }),
                `${source}-${selected.filename}`);
        } catch (err) {
            setError({ msg: err?.message || 'Unable to download logs.', type: 'error' });
        }
    };

    return <div className={'log-explorer'}>
        {error?.msg && <UserMessage closeable={true} onClose={() => setError(null)} message={error} />}
        {queueUnavailable && <UserMessage closeable={false} message={{
            msg: `Queue logs unavailable: ${queueFailure.details || 'Queue could not be reached.'}`, type: 'warning'
        }} />}
        <p>Current logs since last rotation. Logs come from one instance; refreshing may show another.</p>
        <div className={'log-explorer-controls'}>
            <div className={'h-menu log-explorer-controls-row'}><ul>
                <li className={'log-explorer-field'}>
                    <label htmlFor={'log_source'}>Source</label>
                    <select id={'log_source'} value={source} onChange={e => { setSource(e.target.value); setSelection(''); }}>
                        <option value={'api'}>API Logs</option>
                        <option value={'queue'}>Queue Logs</option>
                    </select>
                </li>
                <li className={'log-explorer-field'}>
                    <label htmlFor={'log_file'}>Log File</label>
                    <select id={'log_file'} value={selected?.file || ''} disabled={!sourceFiles.length}
                        onChange={e => setSelection(e.target.value)}>
                        {!sourceFiles.length && <option value={''}>No files available</option>}
                        {sourceFiles.map(file => <option key={file.file} value={file.file}>{fileLabel(file)}</option>)}
                    </select>
                </li>
                <li className={'log-explorer-actions'}>
                    <Button icon={loading ? 'spinner' : 'sync'} spin={loading} label={loading ? 'Loading...' : 'Refresh'}
                        disabled={loading} onClick={refresh} />
                    <Button icon={'download'} label={'Download Log'} disabled={loading || !selected || selected.missing}
                        onClick={download} />
                    <Button icon={'up'} label={'Load Older'} disabled={loading || limit >= lines.length}
                        onClick={() => setLimit(value => value + PREVIEW_LINES)} />
                </li>
                <li className={'log-explorer-field log-explorer-search'}>
                    <label htmlFor={'log_search'}>Search Loaded Lines</label>
                    <input id={'log_search'} value={search} onChange={e => setSearch(e.target.value)}
                        placeholder={'Filter preview'} />
                </li>
            </ul></div>
            <details>
                <summary>More options</summary>
                <div className={'h-menu log-explorer-controls-row'}><ul>
                    <li className={'log-explorer-field'}>
                        <label htmlFor={'log_time_start'}>Start Time</label>
                        <input id={'log_time_start'} type={'datetime-local'} value={startTime} onChange={e => setStartTime(e.target.value)} />
                    </li>
                    <li className={'log-explorer-field'}>
                        <label htmlFor={'log_time_end'}>End Time</label>
                        <input id={'log_time_end'} type={'datetime-local'} value={endTime} onChange={e => setEndTime(e.target.value)} />
                    </li>
                    <li><label><input type={'checkbox'} checked={newestFirst} onChange={e => setNewestFirst(e.target.checked)} />Newest first</label></li>
                    <li><label><input type={'checkbox'} checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />Auto-refresh (12s)</label></li>
                </ul></div>
            </details>
            <div className={'log-explorer-meta'}>
                <span>{rows.length} visible lines of {lines.length}</span>
                {selected && <span>File: {selected.filename}</span>}
                <span>Updated: {updated || 'Not loaded yet'}</span>
            </div>
        </div>
        <div ref={listRef} className={'log-virtual-list'} onScroll={e => setScrollTop(e.target.scrollTop)}>
            {loading && <div className={'log-loading'} role={'status'}>Loading logs...</div>}
            {!loading && !queueUnavailable && !rows.length && <div className={'log-empty'}>
                {selected?.missing ? 'No entries since last rotation.' : 'No log lines found for the current selection.'}
            </div>}
            {!loading && !queueUnavailable && rows.length > 0 && <div className={'log-lines'} style={{ height: `${rows.length * LINE_HEIGHT}px` }}>
                <div style={{ height: `${firstRow * LINE_HEIGHT}px` }} />
                {rows.slice(firstRow, lastRow).map(row => <div className={'log-line'} key={row.lineNumber} style={{ height: `${LINE_HEIGHT}px` }}>
                    <span className={'log-line-number'}>{row.lineNumber}</span>
                    <span className={`log-line-text log-level-${({ FATAL: 'error', WARNING: 'warn', TRACE: 'debug' }[row.severity] || (row.severity || '').toLowerCase())}`}>{row.text}</span>
                </div>)}
                <div style={{ height: `${(rows.length - lastRow) * LINE_HEIGHT}px` }} />
            </div>}
        </div>
        {!loading && source === 'api' && selected?.filename === 'access.log' && !lines.length &&
            <p>HTTP access logging may be disabled at the current log level.</p>}
        <p>Download saves the complete fetched current file, not just the preview. Archives are not available from this endpoint.</p>
    </div>;
};

export default LogExplorer;
