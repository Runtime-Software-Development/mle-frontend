import {
    normalizeAdminJob,
    matchesSearchTerm,
    getDateRangeBoundaries,
    withinDateRange,
} from './adminJobs.utils.client';

describe('adminJobs.utils.client', () => {
    test('normalizes legacy jobs and parses data JSON', () => {
        const raw = {
            jobId: '123',
            status: 'completed',
            timestamp: '2026-08-01T10:00:00.000Z',
            data: JSON.stringify({
                process_type: 'upload_image',
                file: {
                    filename: 'legacy.jpg',
                    owner_id: 99,
                    fs_path: '/uploads/legacy.jpg',
                }
            })
        };

        const normalized = normalizeAdminJob(raw);

        expect(normalized.jobId).toBe('123');
        expect(normalized.status).toBe('completed');
        expect(normalized.parseError).toBe(false);
        expect(normalized.parsedPayload.file.filename).toBe('legacy.jpg');
        expect(normalized.filename).toBe('legacy.jpg');
        expect(normalized.ownerId).toBe('99');
        expect(normalized.processType).toBe('upload_image');
    });

    test('does not crash on malformed legacy data JSON', () => {
        const raw = {
            jobId: 'bad-json',
            status: 'failed',
            data: '{not valid json}',
        };

        const normalized = normalizeAdminJob(raw);

        expect(normalized.jobId).toBe('bad-json');
        expect(normalized.parseError).toBe(true);
        expect(normalized.parsedPayload).toBeNull();
    });

    test('prefers enriched payload and diagnostics warnings/errors', () => {
        const raw = {
            jobId: 'enriched-1',
            status: 'failed',
            payload: {
                process_type: 'upload_image',
                file: {
                    filename: 'enriched.tif',
                    owner_id: 'abc-42',
                }
            },
            diagnostics: {
                warnings: ['w1'],
                errors: ['e1', 'e2'],
                metadata: {
                    exif: { ISO: 200 }
                }
            }
        };

        const normalized = normalizeAdminJob(raw);

        expect(normalized.parseError).toBe(false);
        expect(normalized.filename).toBe('enriched.tif');
        expect(normalized.ownerId).toBe('abc-42');
        expect(normalized.warningCount).toBe(1);
        expect(normalized.errorCount).toBe(2);
        expect(normalized.hasDiagnostics).toBe(true);
    });

    test('search matches normalized fields', () => {
        const normalized = normalizeAdminJob({
            jobId: '777',
            status: 'completed',
            payload: {
                process_type: 'upload_image',
                file: {
                    filename: 'mountain-view.jpg',
                    owner_id: 'station-2',
                }
            }
        });

        expect(matchesSearchTerm(normalized, '777')).toBe(true);
        expect(matchesSearchTerm(normalized, 'mountain-view')).toBe(true);
        expect(matchesSearchTerm(normalized, 'station-2')).toBe(true);
        expect(matchesSearchTerm(normalized, 'upload_image')).toBe(true);
        expect(matchesSearchTerm(normalized, 'nomatch')).toBe(false);
    });

    test('date range boundaries and checks work', () => {
        jest.useFakeTimers().setSystemTime(new Date('2026-08-01T12:00:00.000Z'));

        const inside = normalizeAdminJob({
            jobId: 'inside',
            status: 'completed',
            timestamp: '2026-07-28T12:00:00.000Z',
        });

        const outside = normalizeAdminJob({
            jobId: 'outside',
            status: 'completed',
            timestamp: '2026-06-01T12:00:00.000Z',
        });

        const { startMs, endMs } = getDateRangeBoundaries('7d');

        expect(withinDateRange(inside, startMs, endMs)).toBe(true);
        expect(withinDateRange(outside, startMs, endMs)).toBe(false);

        jest.useRealTimers();
    });
});
