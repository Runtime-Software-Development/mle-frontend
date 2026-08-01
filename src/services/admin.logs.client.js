/*!
 * MLE.Client.Services.AdminLogs
 * File: admin.logs.client.js
 * Copyright (c) 2026 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

const isObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

const normalizeLineArray = (lines) => {
    if (!Array.isArray(lines)) return [];
    return lines.map(line => String(line));
};

const selectLogFileName = (logType = 'access') => {
    return String(logType) === 'error' ? 'error.log' : 'access.log';
};

const findCurrentShapeFile = (files = [], source = 'api', logType = 'access', podFilter = '') => {
    const requestedFileName = selectLogFileName(logType);
    const normalizedSource = String(source || '').toLowerCase();
    const normalizedPod = String(podFilter || '').toLowerCase();

    const normalizedFiles = (Array.isArray(files) ? files : []).map(item => {
        const file = String(item?.file || item?.name || item?.path || '');
        const contents = normalizeLineArray(item?.contents || item?.lines || []);
        return {
            ...item,
            file,
            contents,
            lowerFile: file.toLowerCase(),
        };
    });

    const fileByType = normalizedFiles.filter(item => {
        return item.lowerFile.includes(requestedFileName.toLowerCase());
    });

    const fileBySource = fileByType.filter(item => {
        if (!normalizedSource) return true;
        return item.lowerFile.includes(normalizedSource);
    });

    const fileByPod = fileBySource.filter(item => {
        if (!normalizedPod) return true;
        return item.lowerFile.includes(normalizedPod);
    });

    return fileByPod[0] || fileBySource[0] || fileByType[0] || normalizedFiles[0] || null;
};

const extractCurrentShape = (payload, source, logType, podFilter) => {
    const files = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.files)
            ? payload.files
            : [];

    const selectedFile = findCurrentShapeFile(files, source, logType, podFilter);
    const selectedLines = selectedFile ? normalizeLineArray(selectedFile.contents) : [];

    const podHints = files
        .map(item => String(item?.pod || item?.subdirectory || item?.directory || item?.source || ''))
        .filter(Boolean);

    return {
        mode: 'full',
        sourceAvailable: source === 'api' ? true : !!selectedFile,
        fileAvailable: !!selectedFile,
        selectedFile: selectedFile?.file || null,
        lines: selectedLines,
        hasMore: false,
        nextOffset: null,
        offset: 0,
        total: selectedLines.length,
        pods: Array.from(new Set(podHints)),
        metadata: {
            fileCount: files.length,
        }
    };
};

const extractPagedShape = (payload, source, logType) => {
    const lines = normalizeLineArray(payload?.lines);

    return {
        mode: 'paged',
        sourceAvailable: payload?.source ? String(payload.source) === String(source) : true,
        fileAvailable: payload?.file ? String(payload.file) === selectLogFileName(logType) : true,
        selectedFile: payload?.file || selectLogFileName(logType),
        lines,
        hasMore: !!payload?.hasMore,
        nextOffset: Number.isFinite(Number(payload?.nextOffset)) ? Number(payload.nextOffset) : null,
        offset: Number.isFinite(Number(payload?.offset)) ? Number(payload.offset) : 0,
        total: Number.isFinite(Number(payload?.total)) ? Number(payload.total) : lines.length,
        pods: Array.isArray(payload?.pods) ? payload.pods : [],
        metadata: {
            limit: payload?.limit || lines.length,
        }
    };
};

const normalizeResponseShape = (payload, source, logType, podFilter) => {
    // Future paged shape: {source,file,offset,limit,lines,hasMore}
    if (isObject(payload) && Array.isArray(payload?.lines)) {
        return extractPagedShape(payload, source, logType);
    }

    // Future nested source shape.
    if (isObject(payload) && isObject(payload?.sources)) {
        const sourcePayload = payload.sources[source] || payload.sources[source?.toUpperCase?.()] || null;
        if (sourcePayload && Array.isArray(sourcePayload?.lines)) {
            return extractPagedShape(sourcePayload, source, logType);
        }
        if (sourcePayload && Array.isArray(sourcePayload?.files)) {
            return extractCurrentShape(sourcePayload.files, source, logType, podFilter);
        }
    }

    // Current shape: [{file, contents}] or {files:[...]}
    return extractCurrentShape(payload, source, logType, podFilter);
};

/**
 * Fetch log lines with a compatibility adapter for current and future backend shapes.
 *
 * @param {Object} input
 * @param {Object} input.router
 * @param {string} [input.source]
 * @param {string} [input.logType]
 * @param {number|null} [input.offset]
 * @param {number} [input.limit]
 * @param {string} [input.podFilter]
 * @returns {Promise<Object>}
 */
export const fetchAdminLogSegment = async ({
    router,
    source = 'api',
    logType = 'access',
    offset = null,
    limit = 1000,
    podFilter = '',
}) => {
    const params = {
        source,
        file: selectLogFileName(logType),
        type: logType,
        limit,
    };

    if (offset !== null && Number.isFinite(Number(offset))) {
        params.offset = Number(offset);
    }

    if (podFilter) {
        params.pod = podFilter;
        params.subdirectory = podFilter;
    }

    const res = await router.get('/admin/logs', params);

    if (!res || res.error) {
        const err = res?.error || { msg: 'Unable to load logs.' };
        throw new Error(err?.msg || 'Unable to load logs.');
    }

    const payload = res?.response?.data || [];
    return normalizeResponseShape(payload, source, logType, podFilter);
};

export const parseLogLine = (line = '', lineNumber = 1) => {
    const text = String(line || '');
    const severityMatch = text.match(/\b(FATAL|ERROR|WARN|WARNING|INFO|DEBUG|TRACE)\b/i);
    const timestampMatch = text.match(/\b\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:[\.,]\d+)?(?:Z|[+-]\d{2}:?\d{2})?\b/);

    return {
        lineNumber,
        text,
        severity: severityMatch ? severityMatch[1].toUpperCase() : null,
        timestamp: timestampMatch ? timestampMatch[0] : null,
    };
};
