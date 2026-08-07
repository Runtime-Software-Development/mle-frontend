import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminView from '../components/views/admin.view';

const mockRouter = {
    get: jest.fn(),
    post: jest.fn(),
    deletion: jest.fn(),
};

const asISO = (msOffset = 0) => new Date(Date.now() + msOffset).toISOString();

jest.mock('../../providers/user.provider.client', () => ({
    useUser: () => ({ role: ['administrator'] })
}));

jest.mock('../../providers/router.provider.client', () => ({
    useRouter: () => mockRouter
}));

jest.mock('../../components/common/accordion', () => {
    return function MockAccordion({ label, children, menu }) {
        return (
            <section>
                <h2>{label}</h2>
                {menu}
                <div>{children}</div>
            </section>
        );
    };
});

jest.mock('../../components/common/badge', () => {
    return function MockBadge({ label }) {
        return <span>{label}</span>;
    };
});

jest.mock('../../components/common/loading', () => {
    return function MockLoading({ label }) {
        return <div>{label || 'Loading'}</div>;
    };
});

jest.mock('../../components/common/message', () => ({
    UserMessage: ({ message }) => <div>{message?.msg}</div>
}));

jest.mock('../../components/common/button', () => {
    return function MockButton({ label, icon, onClick, disabled }) {
        const text = label || icon || 'button';
        return (
            <button type="button" onClick={onClick} disabled={disabled}>
                {text}
            </button>
        );
    };
});

jest.mock('../../components/common/dialog', () => {
    return function MockDialog({ title, children, callback }) {
        return (
            <div>
                <h3>{title}</h3>
                <button type="button" onClick={callback}>Close</button>
                {children}
            </div>
        );
    };
});

jest.mock('../../components/common/table', () => {
    return function MockTable({ rows, cols }) {
        return (
            <table>
                <thead>
                    <tr>
                        {cols.map(col => <th key={col.name}>{col.label}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => (
                        <tr key={`row_${idx}`}>
                            {cols.map(col => <td key={`${idx}_${col.name}`}>{row[col.name]}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };
});

const buildLegacyJob = (overrides = {}) => ({
    jobId: overrides.jobId || '1001',
    status: overrides.status || 'completed',
    timestamp: overrides.timestamp || asISO(-5 * 60 * 1000),
    processedOn: overrides.processedOn || asISO(-3 * 60 * 1000),
    finishedOn: overrides.finishedOn || asISO(-2 * 60 * 1000),
    data: overrides.data || JSON.stringify({
        process_type: 'upload_image',
        file: {
            filename: 'legacy-file.jpg',
            owner_id: 'owner-legacy',
        }
    }),
    error: overrides.error || '{}',
    ...overrides,
});

const buildEnrichedJob = (overrides = {}) => ({
    jobId: overrides.jobId || '2001',
    status: overrides.status || 'failed',
    timestamp: overrides.timestamp || asISO(-10 * 60 * 1000),
    processedOn: overrides.processedOn || asISO(-8 * 60 * 1000),
    finishedOn: overrides.finishedOn || asISO(-7 * 60 * 1000),
    payload: overrides.payload || {
        process_type: 'upload_image',
        file: {
            filename: 'enriched-file.tif',
            owner_id: 'owner-enriched',
            fs_path: '/uploads/enriched-file.tif',
        }
    },
    attemptsMade: overrides.attemptsMade ?? 2,
    attemptsMax: overrides.attemptsMax ?? 5,
    failedReason: overrides.failedReason || 'EXIF parse warning',
    diagnostics: overrides.diagnostics || {
        warnings: ['warn-1'],
        errors: ['err-1'],
        events: [
            { timestamp: '2026-08-01T11:00:01.000Z', event: 'started', message: 'started' },
            { timestamp: '2026-08-01T11:00:30.000Z', event: 'failed', message: 'failed' },
        ],
        metadata: {
            exif: {
                ISO: 400,
                FNumber: 'f/8'
            }
        }
    },
    warnings: overrides.warnings,
    errors: overrides.errors,
    ...overrides,
});

const setupRouter = ({ jobs = [], counts = { completed: 0, active: 0, delayed: 0, waiting: 0, failed: 0 } } = {}) => {
    mockRouter.get.mockImplementation((route) => {
        if (route === '/admin/status') {
            return Promise.resolve({
                response: {
                    data: {
                        server: { status: true },
                        database: { status: true },
                        queue: { status: true },
                    }
                }
            });
        }

        if (route === '/admin/logs') {
            return Promise.resolve({ response: { data: [] } });
        }

        if (route === '/admin/jobs') {
            return Promise.resolve({ response: { data: { jobs, counts } } });
        }

        return Promise.resolve({ response: { data: {} } });
    });

    mockRouter.post.mockResolvedValue({ response: { data: { status: 'waiting', timestamp: '2026-08-01T12:00:00.000Z' } } });
    mockRouter.deletion.mockResolvedValue({ response: { data: { status: 'removed', timestamp: '2026-08-01T12:00:00.000Z' } } });
};

describe('AdminView jobs history', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('legacy-only records still render with existing columns/actions', async () => {
        setupRouter({
            jobs: [buildLegacyJob()],
            counts: { completed: 1, active: 0, delayed: 0, waiting: 0, failed: 0 }
        });

        render(<AdminView />);

        await waitFor(() => {
            expect(screen.getByText('File Processing Jobs History')).toBeInTheDocument();
        });

        await waitFor(() => expect(screen.getByText('1001')).toBeInTheDocument());

        expect(screen.getByText('Job ID')).toBeInTheDocument();
        expect(screen.getByText('Process Type')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Timestamp')).toBeInTheDocument();
        expect(screen.getByText('Details')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
        expect(screen.getByText('Remove')).toBeInTheDocument();

        expect(screen.getAllByText('completed').length).toBeGreaterThan(0);
    });

    test('enriched records show diagnostics and EXIF details', async () => {
        setupRouter({
            jobs: [buildEnrichedJob()],
            counts: { completed: 0, active: 0, delayed: 0, waiting: 0, failed: 1 }
        });

        render(<AdminView />);

        await waitFor(() => expect(screen.getByText('2001')).toBeInTheDocument());

        expect(screen.getByText('Process Type')).toBeInTheDocument();

        const detailsButtons = screen.getAllByRole('button', { name: 'info' });
        fireEvent.click(detailsButtons[0]);

        expect(screen.getByText(/Transaction Details:/i)).toBeInTheDocument();
        expect(screen.getByText('EXIF')).toBeInTheDocument();
        expect(screen.getByText(/"ISO"\s*:\s*400/i)).toBeInTheDocument();
    });

    test('malformed legacy data does not break page and shows warning', async () => {
        setupRouter({
            jobs: [buildLegacyJob({ data: '{bad json}' })],
            counts: { completed: 0, active: 0, delayed: 0, waiting: 0, failed: 1 }
        });

        render(<AdminView />);

        await waitFor(() => expect(screen.getByText(/could not be parsed/i)).toBeInTheDocument());

        expect(screen.getByText(/could not be parsed/i)).toBeInTheDocument();
    });

    test('status/date filters and search work with history data', async () => {
        const oldJob = buildLegacyJob({
            jobId: '3001',
            status: 'completed',
            timestamp: '2026-05-01T00:00:00.000Z',
            data: JSON.stringify({ process_type: 'upload_image', file: { filename: 'old-file.jpg', owner_id: 'owner-old' } })
        });

        const activeJob = buildLegacyJob({
            jobId: '3002',
            status: 'active',
            timestamp: '2026-08-01T11:00:00.000Z',
            data: JSON.stringify({ process_type: 'upload_image', file: { filename: 'new-file.jpg', owner_id: 'owner-new' } })
        });

        setupRouter({
            jobs: [oldJob, activeJob],
            counts: { completed: 1, active: 1, delayed: 0, waiting: 0, failed: 0 }
        });

        render(<AdminView />);

        await waitFor(() => expect(screen.getByText('3002')).toBeInTheDocument());

        expect(screen.queryByText('3001')).not.toBeInTheDocument();
        expect(screen.getByText('3002')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'new-file.jpg' } });
        expect(screen.getByText('3002')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText(/active/i));
        expect(screen.getByText(/No jobs match the current filters/i)).toBeInTheDocument();
    });

    test('unchecking completed hides completed jobs', async () => {
        setupRouter({
            jobs: [
                buildLegacyJob({
                    jobId: '4101',
                    status: 'completed',
                    data: JSON.stringify({ process_type: 'upload_image', file: { filename: 'completed-only.jpg', owner_id: 'owner-a' } })
                }),
                buildLegacyJob({
                    jobId: '4102',
                    status: 'failed',
                    data: JSON.stringify({ process_type: 'upload_image', file: { filename: 'failed-only.jpg', owner_id: 'owner-b' } })
                }),
            ],
            counts: { completed: 1, active: 0, delayed: 0, waiting: 0, failed: 1 }
        });

        render(<AdminView />);

        await waitFor(() => expect(screen.getByText('4101')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('4102')).toBeInTheDocument());

        fireEvent.click(screen.getByLabelText(/completed/i));

        await waitFor(() => {
            expect(screen.queryByText('4101')).not.toBeInTheDocument();
        });
        expect(screen.getByText('4102')).toBeInTheDocument();
    });

    test('groups related worker jobs under one transaction summary', async () => {
        const ts = '2026-08-01T11:00:00.000Z';

        setupRouter({
            jobs: [
                buildEnrichedJob({
                    jobId: 'tx-1-a',
                    timestamp: ts,
                    payload: {
                        process_type: 'upload_image',
                        file: {
                            filename: 'same-upload.jpg',
                            owner_id: 'owner-1',
                            filename_tmp: '/tmp/same-upload.jpg'
                        }
                    }
                }),
                buildEnrichedJob({
                    jobId: 'tx-1-b',
                    status: 'completed',
                    timestamp: ts,
                    payload: {
                        process_type: 'metadata_extract',
                        file: {
                            filename: 'same-upload.jpg',
                            owner_id: 'owner-1',
                            filename_tmp: '/tmp/same-upload.jpg'
                        }
                    }
                }),
            ],
            counts: { completed: 1, active: 0, delayed: 0, waiting: 0, failed: 1 }
        });

        render(<AdminView />);

        await waitFor(() => expect(screen.getByText('same-upload.jpg (2 jobs)')).toBeInTheDocument());
        expect(screen.getByText(/matching transactions/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'info' }));
        expect(screen.getByText('Transaction Details: same-upload.jpg')).toBeInTheDocument();
        expect(screen.getByText('tx-1-a')).toBeInTheDocument();
        expect(screen.getByText('tx-1-b')).toBeInTheDocument();
    });

    test('retry/remove actions keep existing endpoints', async () => {
        const job = buildLegacyJob({ jobId: '999', status: 'failed' });

        setupRouter({
            jobs: [job],
            counts: { completed: 0, active: 0, delayed: 0, waiting: 0, failed: 1 }
        });

        render(<AdminView />);

        await waitFor(() => expect(screen.getByRole('button', { name: 'reset' })).toBeInTheDocument());

        const retryButtons = screen.getAllByRole('button', { name: 'reset' });
        fireEvent.click(retryButtons[0]);
        await waitFor(() => {
            expect(mockRouter.post).toHaveBeenCalledWith('/admin/jobs/retry/999');
        });

        const removeButtons = screen.getAllByRole('button', { name: 'delete' });
        fireEvent.click(removeButtons[0]);
        await waitFor(() => {
            expect(mockRouter.deletion).toHaveBeenCalledWith('/admin/jobs/remove/999');
        });
    });

    test('large datasets remain usable via pagination', async () => {
        const largeJobs = Array.from({ length: 5000 }, (_, idx) => {
            const id = String(10000 + idx);
            return buildLegacyJob({
                jobId: id,
                status: idx % 5 === 0 ? 'failed' : 'completed',
                timestamp: asISO(-(idx * 1000)),
                data: JSON.stringify({ process_type: 'upload_image', file: { filename: `file-${id}.jpg`, owner_id: `owner-${id}` } })
            });
        });

        setupRouter({
            jobs: largeJobs,
            counts: { completed: 4000, active: 0, delayed: 0, waiting: 0, failed: 1000 }
        });

        render(<AdminView />);

        await waitFor(() => expect(screen.getByText(/Page 1 of 50/i)).toBeInTheDocument(), { timeout: 15000 });

        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(screen.getByText(/Page 2 of 50/i)).toBeInTheDocument();
    });
});
