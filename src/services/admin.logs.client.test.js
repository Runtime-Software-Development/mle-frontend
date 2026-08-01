import { fetchAdminLogSegment, parseLogLine } from './admin.logs.client';

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
            logType: 'access',
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
            logType: 'error',
            offset: 100,
            limit: 3,
        });

        expect(segment.mode).toBe('paged');
        expect(segment.lines.length).toBe(3);
        expect(segment.hasMore).toBe(true);
        expect(segment.nextOffset).toBe(97);
    });

    test('parseLogLine extracts severity and timestamp', () => {
        const row = parseLogLine('2026-08-01 12:00:01 ERROR worker failure', 42);
        expect(row.lineNumber).toBe(42);
        expect(row.timestamp).toBe('2026-08-01 12:00:01');
        expect(row.severity).toBe('ERROR');
    });
});
