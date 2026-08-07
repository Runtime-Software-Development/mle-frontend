import { fetchAdminLogSegment, parseLogLine } from '../services/admin.logs.client';

describe('admin.logs.client', () => {
    test('adapts current logs payload shape', async () => {
        const router = {
            get: jest.fn().mockResolvedValue({
                response: {
                    data: [
                        { file: 'api/access.log', contents: ['line 1', 'line 2'] },
                        { file: 'api/error.log', contents: ['err 1'] },
                    ]
                }
            })
        };

        const segment = await fetchAdminLogSegment({
            router,
            source: 'api',
            fileName: 'api/access.log',
        });

        expect(segment.mode).toBe('full');
        expect(segment.fileAvailable).toBe(true);
        expect(segment.lines).toEqual(['line 1', 'line 2']);
    });

    test('adapts future paged payload shape', async () => {
        const router = {
            get: jest.fn().mockResolvedValue({
                response: {
                    data: {
                        source: 'api',
                        file: 'error.log',
                        offset: 100,
                        limit: 3,
                        hasMore: true,
                        nextOffset: 97,
                        lines: ['l1', 'l2', 'l3'],
                    }
                }
            })
        };

        const segment = await fetchAdminLogSegment({
            router,
            source: 'api',
            fileName: 'error.log',
            offset: 100,
            limit: 3,
        });

        expect(segment.mode).toBe('paged');
        expect(segment.lines.length).toBe(3);
        expect(segment.hasMore).toBe(true);
        expect(segment.nextOffset).toBe(97);
    });

    test('extracts pod options and supports pod filtering from per-pod file paths', async () => {
        const router = {
            get: jest.fn().mockResolvedValue({
                response: {
                    data: [
                        { file: 'api/pod-a/access.log', contents: ['a-1'] },
                        { file: 'api/pod-b/access.log', contents: ['b-1'] },
                    ]
                }
            })
        };

        const segment = await fetchAdminLogSegment({
            router,
            source: 'api',
            fileName: 'api/pod-b/access.log',
            podFilter: 'pod-b',
        });

        expect(segment.fileAvailable).toBe(true);
        expect(segment.lines).toEqual(['b-1']);
        expect(segment.pods).toEqual(expect.arrayContaining(['pod-a', 'pod-b']));
    });

    test('treats root-level queue error filenames as queue logs', async () => {
        const router = {
            get: jest.fn().mockResolvedValue({
                response: {
                    data: [
                        { file: 'queue-error.log', contents: ['queue failure'] },
                    ]
                }
            })
        };

        const segment = await fetchAdminLogSegment({
            router,
            source: 'queue',
            fileName: 'queue-error.log',
        });

        expect(segment.sourceAvailable).toBe(true);
        expect(segment.fileAvailable).toBe(true);
        expect(segment.inventory[0].source).toBe('queue');
        expect(segment.lines).toEqual(['queue failure']);
    });

    test('parseLogLine extracts severity and timestamp', () => {
        const row = parseLogLine('2026-08-01 12:00:01 ERROR worker failure', 42);
        expect(row.lineNumber).toBe(42);
        expect(row.timestamp).toBe('2026-08-01 12:00:01');
        expect(row.severity).toBe('ERROR');
    });
});
