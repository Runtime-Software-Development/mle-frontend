/*! 
 * MLE.Client.Utilities.AdminJobs
 * File: adminJobs.utils.client.js
 * Copyright (c) 2026 Runtime Software Development Inc.
 * Version 2.1
 * MIT Licensed
 */

/**
 * @typedef {Object} AdminJobDiagnostics
 * @property {string|null|undefined} [startedAt]
 * @property {string|null|undefined} [finishedAt]
 * @property {string|null|undefined} [status]
 * @property {Array<Object>|null|undefined} [events]
 * @property {Array<string|Object>|null|undefined} [warnings]
 * @property {Array<string|Object>|null|undefined} [errors]
 * @property {Object|null|undefined} [paths]
 * @property {Object|null|undefined} [metadata]
 */

/**
 * @typedef {Object} AdminJobRaw
 * @property {string|number} [jobId]
 * @property {string} [data]
 * @property {string} [error]
 * @property {string} [status]
 * @property {string} [timestamp]
 * @property {string} [processedOn]
 * @property {string} [finishedOn]
 * @property {Object} [payload]
 * @property {number} [attemptsMade]
 * @property {number} [attemptsMax]
 * @property {Object|string|null} [returnValue]
 * @property {string|null} [failedReason]
 * @property {Array<string>|null} [stacktrace]
 * @property {AdminJobDiagnostics|null} [diagnostics]
 * @property {string|null} [tempFilePath]
 * @property {string|null} [uploadPath]
 * @property {Array<string|Object>|null} [warnings]
 * @property {Array<string|Object>|null} [errors]
 */

/**
 * @typedef {Object} AdminJobNormalized
 * @property {AdminJobRaw} raw
 * @property {string} jobId
 * @property {string} status
 * @property {Object|null} parsedPayload
 * @property {boolean} parseError
 * @property {Array<string|Object>} warnings
 * @property {Array<string|Object>} errors
 * @property {number} warningCount
 * @property {number} errorCount
 * @property {number|null} attemptsMade
 * @property {number|null} attemptsMax
 * @property {Object|string|null} returnValue
 * @property {string|null} failedReason
 * @property {Array<string>} stacktrace
 * @property {AdminJobDiagnostics} diagnostics
 * @property {string|null} tempFilePath
 * @property {string|null} uploadPath
 * @property {string|null} filename
 * @property {string|null} ownerId
 * @property {string|null} processType
 * @property {Object} timestamps
 * @property {string} timestamp
 * @property {string} processedOn
 * @property {string} finishedOn
 * @property {string} timestampDisplay
 * @property {string} processedOnDisplay
 * @property {string} finishedOnDisplay
 * @property {number} sortTimestampMs
 * @property {boolean} hasDiagnostics
 */

const DEFAULT_TIMESTAMP_DISPLAY = 'n/a';

const isObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value === null || typeof value === 'undefined') return [];
    return [value];
};

const safeParseJSON = (value, fallback = null) => {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    if (!trimmed) return fallback;

    try {
        return JSON.parse(trimmed);
    } catch {
        return fallback;
    }
};

const normalizeTimestampValue = (value) => {
    const date = value ? new Date(value) : null;
    const isValid = !!date && !Number.isNaN(date.getTime());

    return {
        raw: value || null,
        ms: isValid ? date.getTime() : 0,
        display: isValid ? date.toLocaleString() : DEFAULT_TIMESTAMP_DISPLAY,
    };
};

const getPayloadValue = (payload = {}, path = []) => {
    let current = payload;
    for (let i = 0; i < path.length; i++) {
        const key = path[i];
        if (!isObject(current) || !Object.prototype.hasOwnProperty.call(current, key)) {
            return null;
        }
        current = current[key];
    }
    return current;
};

const normalizeStatus = (status) => {
    const value = String(status || '').trim().toLowerCase();
    if (!value) return 'unknown';

    // Map common backend variants to canonical UI statuses.
    const statusAliases = {
        pending: 'waiting',
        queued: 'waiting',
        wait: 'waiting',
        in_progress: 'active',
        processing: 'active',
        done: 'completed',
        complete: 'completed',
        success: 'completed',
        error: 'failed',
    };

    return statusAliases[value] || value;
};

const normalizeStacktrace = (stacktrace, legacyError) => {
    if (Array.isArray(stacktrace)) return stacktrace;

    const parsedLegacyError = safeParseJSON(legacyError, null);
    if (Array.isArray(parsedLegacyError)) return parsedLegacyError;
    if (isObject(parsedLegacyError) && Array.isArray(parsedLegacyError.stacktrace)) {
        return parsedLegacyError.stacktrace;
    }

    if (typeof legacyError === 'string' && legacyError.trim()) {
        return [legacyError];
    }

    return [];
};

/**
 * Normalize admin jobs records so mixed legacy/enriched responses can be rendered safely.
 *
 * @param {AdminJobRaw} rawJob
 * @returns {AdminJobNormalized}
 */
export const normalizeAdminJob = (rawJob = {}) => {
    const hasPayload = isObject(rawJob.payload);
    let parsedPayload = null;
    let parseError = false;

    if (hasPayload) {
        parsedPayload = rawJob.payload;
    } else {
        parsedPayload = safeParseJSON(rawJob.data, null);
        if (!parsedPayload && typeof rawJob.data === 'string' && rawJob.data.trim()) {
            parseError = true;
        }
    }

    const diagnostics = isObject(rawJob.diagnostics) ? rawJob.diagnostics : {};

    const warnings = toArray(rawJob.warnings).length > 0
        ? toArray(rawJob.warnings)
        : toArray(diagnostics.warnings);

    const errors = toArray(rawJob.errors).length > 0
        ? toArray(rawJob.errors)
        : toArray(diagnostics.errors);

    const timestamp = normalizeTimestampValue(rawJob.timestamp);
    const processedOn = normalizeTimestampValue(rawJob.processedOn);
    const finishedOn = normalizeTimestampValue(rawJob.finishedOn);

    const payload = isObject(parsedPayload) ? parsedPayload : {};
    const payloadFile = isObject(payload.file) ? payload.file : {};

    const filename = payloadFile.filename
        || getPayloadValue(payload, ['filename'])
        || null;

    const ownerId = payloadFile.owner_id
        || payload.owner_id
        || getPayloadValue(payload, ['owner', 'owner_id'])
        || null;

    const processType = payload.process_type
        || payload.processType
        || null;

    const tempFilePath = rawJob.tempFilePath
        || getPayloadValue(payload, ['src'])
        || payloadFile.filename_tmp
        || getPayloadValue(diagnostics, ['paths', 'tempFilePath'])
        || null;

    const uploadPath = rawJob.uploadPath
        || payloadFile.fs_path
        || getPayloadValue(diagnostics, ['paths', 'uploadPath'])
        || null;

    const attemptsMade = Number.isFinite(Number(rawJob.attemptsMade))
        ? Number(rawJob.attemptsMade)
        : null;

    const attemptsMax = Number.isFinite(Number(rawJob.attemptsMax))
        ? Number(rawJob.attemptsMax)
        : null;

    return {
        raw: rawJob,
        jobId: String(rawJob.jobId || ''),
        status: normalizeStatus(rawJob.status),
        parsedPayload,
        parseError,
        warnings,
        errors,
        warningCount: warnings.length,
        errorCount: errors.length,
        attemptsMade,
        attemptsMax,
        returnValue: typeof rawJob.returnValue === 'undefined' ? null : rawJob.returnValue,
        failedReason: rawJob.failedReason || null,
        stacktrace: normalizeStacktrace(rawJob.stacktrace, rawJob.error),
        diagnostics,
        tempFilePath,
        uploadPath,
        filename,
        ownerId: ownerId !== null ? String(ownerId) : null,
        processType: processType !== null ? String(processType) : null,
        timestamps: {
            timestamp,
            processedOn,
            finishedOn,
        },
        timestamp: timestamp.raw,
        processedOn: processedOn.raw,
        finishedOn: finishedOn.raw,
        timestampDisplay: timestamp.display,
        processedOnDisplay: processedOn.display,
        finishedOnDisplay: finishedOn.display,
        sortTimestampMs: timestamp.ms || processedOn.ms || finishedOn.ms || 0,
        hasDiagnostics: isObject(rawJob.diagnostics),
    };
};

export const ADMIN_JOB_STATUSES = ['waiting', 'delayed', 'active', 'completed', 'failed'];

export const getDateRangeBoundaries = (preset = '30d', customStart = '', customEnd = '') => {
    const now = Date.now();

    if (preset === 'custom') {
        const start = customStart ? new Date(customStart).getTime() : null;
        const end = customEnd ? new Date(customEnd).getTime() : null;
        return {
            startMs: Number.isFinite(start) ? start : null,
            endMs: Number.isFinite(end) ? end : null,
        };
    }

    const DAY_MS = 24 * 60 * 60 * 1000;
    const map = {
        '24h': now - DAY_MS,
        '7d': now - (7 * DAY_MS),
        '30d': now - (30 * DAY_MS),
    };

    return {
        startMs: map[preset] || map['30d'],
        endMs: now,
    };
};

export const withinDateRange = (normalizedJob, startMs, endMs) => {
    const timestampMs = normalizedJob.sortTimestampMs;
    if (!timestampMs) return false;
    if (startMs !== null && timestampMs < startMs) return false;
    if (endMs !== null && timestampMs > endMs) return false;
    return true;
};

export const matchesSearchTerm = (normalizedJob, searchTerm = '') => {
    const term = String(searchTerm || '').trim().toLowerCase();
    if (!term) return true;

    const searchFields = [
        normalizedJob.jobId,
        normalizedJob.filename,
        normalizedJob.ownerId,
        normalizedJob.processType,
    ]
        .filter(Boolean)
        .map(value => String(value).toLowerCase());

    return searchFields.some(value => value.includes(term));
};
