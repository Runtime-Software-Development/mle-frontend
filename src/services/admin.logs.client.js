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

const inferSourceFromFilePath = (filePath = '') => {
    const normalized = String(filePath || '').replace(/\\/g, '/').toLowerCase();
    if (!normalized) return null;

    if (normalized.startsWith('queue/') || normalized.includes('/queue/')) return 'queue';
    if (normalized.startsWith('api/') || normalized.includes('/api/')) return 'api';
    return null;
};

const inferPodFromFilePath = (filePath = '', source = 'api') => {
    const normalized = String(filePath || '').replace(/\\/g, '/').toLowerCase();
    if (!normalized) return null;

    const parts = normalized.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const filename = parts[parts.length - 1];
    if (!filename.endsWith('.log')) return null;

    const parent = parts[parts.length - 2] || '';
    if (!parent) return null;
    if (parent === String(source || '').toLowerCase()) return null;
    if (parent === 'logs' || parent === 'log') return null;

    return parent;
};

const normalizeInventoryFiles = (files = [], requestedSource = 'api') => {
    return (Array.isArray(files) ? files : []).map(item => {
        const file = String(item?.file || item?.name || item?.path || '');
        const contents = normalizeLineArray(item?.contents || item?.lines || []);
        const explicitPod = String(item?.pod || item?.subdirectory || item?.directory || '').trim();
        const explicitSource = String(item?.source || '').trim().toLowerCase();

        const inferredSource = inferSourceFromFilePath(file);
        const source = explicitSource || inferredSource || String(requestedSource || 'api').toLowerCase();
        const inferredPod = inferPodFromFilePath(file, source);

        return {
            ...item,
            file,
            contents,
            filename: file.split('/').filter(Boolean).pop() || file,
            source,
            pod: explicitPod || inferredPod || '',
            lowerPod: (explicitPod || inferredPod || '').toLowerCase(),
            lowerFile: file.toLowerCase(),
        };
    });
};

const filterFilesBySourceAndPod = (normalizedFiles = [], source = 'api', podFilter = '') => {
    const normalizedSource = String(source || '').toLowerCase();
    const normalizedPod = String(podFilter || '').toLowerCase();

    const sourceFiles = normalizedFiles.filter(item => {
        if (!normalizedSource) return true;
        return item.source === normalizedSource || item.lowerFile.includes(normalizedSource);
    });

    const podFiles = sourceFiles.filter(item => {
        if (!normalizedPod) return true;
        if (item.lowerPod && item.lowerPod.includes(normalizedPod)) return true;
        return item.lowerFile.includes(normalizedPod);
    });

    return {
        sourceFiles,
        podFiles,
    };
};

const pickSelectedFile = (files = [], requestedFile = '') => {
    const normalizedRequested = String(requestedFile || '').toLowerCase().trim();
    if (normalizedRequested) {
        const exact = files.find(item => String(item.file || '').toLowerCase() === normalizedRequested);
        if (exact) return exact;

        const byName = files.find(item => String(item.filename || '').toLowerCase() === normalizedRequested);
        if (byName) return byName;
    }

    return files[0] || null;
};

const toInventory = (files = []) => {
    return files.map(item => ({
        file: item.file,
        filename: item.filename,
        source: item.source,
        pod: item.pod || '',
        lineCount: item.contents.length,
    }));
};

const extractCurrentShape = (payload, source, requestedFile, podFilter) => {
    const files = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.files)
            ? payload.files
            : [];

    const normalizedFiles = normalizeInventoryFiles(files, source);
    const { sourceFiles, podFiles } = filterFilesBySourceAndPod(normalizedFiles, source, podFilter);

    const selectedFile = pickSelectedFile(podFiles, requestedFile);
    const selectedLines = selectedFile ? normalizeLineArray(selectedFile.contents) : [];

    const podHints = sourceFiles
        .map(item => item.pod)
        .filter(Boolean);

    const inventory = toInventory(podFiles);

    const sourceAvailable = source === 'api' ? true : sourceFiles.length > 0;

    return {
        mode: 'full',
        sourceAvailable,
        fileAvailable: !!selectedFile,
        selectedFile: selectedFile?.file || null,
        lines: selectedLines,
        hasMore: false,
        nextOffset: null,
        offset: 0,
        total: selectedLines.length,
        pods: Array.from(new Set(podHints)),
        inventory,
        metadata: {
            fileCount: files.length,
        }
    };
};

const extractPagedShape = (payload, source, requestedFile) => {
    const lines = normalizeLineArray(payload?.lines);
    const selectedFile = String(payload?.file || requestedFile || '').trim();
    const selectedSource = String(payload?.source || source || 'api').toLowerCase();

    let inventory = [];
    if (Array.isArray(payload?.files)) {
        const normalizedFiles = normalizeInventoryFiles(payload.files, selectedSource);
        inventory = toInventory(normalizedFiles);
    }

    if (inventory.length === 0 && selectedFile) {
        inventory = [{
            file: selectedFile,
            filename: selectedFile.split('/').filter(Boolean).pop() || selectedFile,
            source: selectedSource,
            pod: '',
            lineCount: lines.length,
        }];
    }

    return {
        mode: 'paged',
        sourceAvailable: payload?.source ? String(payload.source).toLowerCase() === String(source).toLowerCase() : true,
        fileAvailable: payload?.file ? (String(payload.file) === String(requestedFile || payload.file)) : true,
        selectedFile: selectedFile || null,
        lines,
        hasMore: !!payload?.hasMore,
        nextOffset: Number.isFinite(Number(payload?.nextOffset)) ? Number(payload.nextOffset) : null,
        offset: Number.isFinite(Number(payload?.offset)) ? Number(payload.offset) : 0,
        total: Number.isFinite(Number(payload?.total)) ? Number(payload.total) : lines.length,
        pods: Array.isArray(payload?.pods) ? payload.pods : [],
        inventory,
        metadata: {
            limit: payload?.limit || lines.length,
        }
    };
};

const normalizeResponseShape = (payload, source, requestedFile, podFilter) => {
    // Future paged shape: {source,file,offset,limit,lines,hasMore}
    if (isObject(payload) && Array.isArray(payload?.lines)) {
        return extractPagedShape(payload, source, requestedFile);
    }

    // Future nested source shape.
    if (isObject(payload) && isObject(payload?.sources)) {
        const sourcePayload = payload.sources[source] || payload.sources[source?.toUpperCase?.()] || null;
        if (sourcePayload && Array.isArray(sourcePayload?.lines)) {
            return extractPagedShape(sourcePayload, source, requestedFile);
        }
        if (sourcePayload && Array.isArray(sourcePayload?.files)) {
            return extractCurrentShape(sourcePayload.files, source, requestedFile, podFilter);
        }
    }

    // Current shape: [{file, contents}] or {files:[...]}
    return extractCurrentShape(payload, source, requestedFile, podFilter);
};

/**
 * Fetch log lines with a compatibility adapter for current and future backend shapes.
 *
 * @param {Object} input
 * @param {Object} input.router
 * @param {string} [input.source]
 * @param {string} [input.fileName]
 * @param {number|null} [input.offset]
 * @param {number} [input.limit]
 * @param {string} [input.podFilter]
 * @returns {Promise<Object>}
 */
export const fetchAdminLogSegment = async ({
    router,
    source = 'api',
    fileName = '',
    offset = null,
    limit = 1000,
    podFilter = '',
}) => {
    const requestedFile = String(fileName || '').trim();

    const params = {
        source,
        limit,
    };

    if (requestedFile) {
        params.file = requestedFile;
    }

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
    return normalizeResponseShape(payload, source, requestedFile, podFilter);
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
