import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import LogExplorer from '../../components/views/logExplorer.view';

jest.mock('../../components/common/button', () => {
    return function MockButton({ label, icon, onClick, disabled }) {
        return (
            <button type="button" disabled={disabled} onClick={onClick}>
                {label || icon || 'button'}
            </button>
        );
    };
});

jest.mock('../../components/common/message', () => ({
    UserMessage: ({ message }) => <div>{message?.msg}</div>
}));

class MockResizeObserver {
    observe() {}
    disconnect() {}
    unobserve() {}
}

global.ResizeObserver = MockResizeObserver;

const getRouter = (impl) => ({
    get: jest.fn(impl),
});

describe('LogExplorer', () => {
    test('renders API logs from /admin/logs current shape', async () => {
        const router = getRouter(() => Promise.resolve({
            response: {
                data: [
                    { file: 'api/access.log', contents: ['2026-08-01 12:00:00 INFO start', '2026-08-01 12:00:01 ERROR fail'] },
                    { file: 'api/error.log', contents: ['error one'] },
                ]
            }
        }));

        render(<LogExplorer router={router} refreshToken={0} />);

        await waitFor(() => {
            expect(screen.getByText(/2 visible lines/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/Source: API/i)).toBeInTheDocument();
        expect(screen.getByText(/Pod: All/i)).toBeInTheDocument();
        expect(screen.getByText(/Returned: 2/i)).toBeInTheDocument();
        expect(screen.getByText(/File: api\/access.log/i)).toBeInTheDocument();
    });

    test('shows queue endpoint unavailable message gracefully', async () => {
        const router = getRouter((route, params) => {
            if (params?.source === 'queue') {
                return Promise.resolve({ error: { msg: 'Not found' } });
            }
            return Promise.resolve({ response: { data: [{ file: 'api/access.log', contents: ['ok'] }] } });
        });

        render(<LogExplorer router={router} refreshToken={0} />);

        await waitFor(() => expect(screen.getByText(/1 visible lines/i)).toBeInTheDocument());

        fireEvent.change(screen.getByLabelText('Source'), { target: { value: 'queue' } });

        await waitFor(() => {
            expect(screen.getByText(/Queue logs unavailable for current environment./i)).toBeInTheDocument();
        });
    });

    test('virtualized list limits rendered line rows for large datasets', async () => {
        const lines = Array.from({ length: 50000 }, (_, i) => `2026-08-01 12:00:${String(i % 60).padStart(2, '0')} INFO line ${i}`);
        const router = getRouter(() => Promise.resolve({
            response: {
                data: [{ file: 'api/access.log', contents: lines }]
            }
        }));

        render(<LogExplorer router={router} refreshToken={0} />);

        await waitFor(() => {
            expect(screen.getByText(/1200 visible lines/i)).toBeInTheDocument();
        });

        const renderedLineNodes = document.querySelectorAll('.log-line');
        expect(renderedLineNodes.length).toBeLessThan(200);
    });

    test('supports newest-first toggle and time filtering', async () => {
        const router = getRouter(() => Promise.resolve({
            response: {
                data: [
                    {
                        file: 'api/access.log',
                        contents: [
                            '2026-08-01 12:00:00 INFO line 0',
                            '2026-08-01 12:00:01 INFO line 1',
                            '2026-08-01 12:00:02 INFO line 2',
                        ]
                    }
                ]
            }
        }));

        render(<LogExplorer router={router} refreshToken={0} />);

        await waitFor(() => {
            expect(screen.getByText(/3 visible lines/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            const firstRowBeforeToggle = document.querySelector('.log-line-text');
            expect(firstRowBeforeToggle?.textContent || '').toMatch(/line 2/i);
        });

        fireEvent.click(screen.getByLabelText(/Newest first/i));

        await waitFor(() => {
            const firstRowAfterToggle = document.querySelector('.log-line-text');
            expect(firstRowAfterToggle?.textContent || '').toMatch(/line 0/i);
        });

        fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: '2026-08-01T12:00:01' } });

        await waitFor(() => {
            expect(screen.getByText(/2 visible lines/i)).toBeInTheDocument();
        });
    });

    test('discovers mixed log files dynamically and allows selecting rotated file by source metadata', async () => {
        const router = getRouter((route, params) => {
            if (params?.file === 'api/20260801-1200-01-access.log.gz') {
                return Promise.resolve({
                    response: {
                        data: [
                            { file: 'api/access.log', contents: ['current access'] },
                            { file: 'api/error.log', contents: ['current error'] },
                            { file: 'api/queue.log', contents: ['queue bridge'] },
                            { file: 'api/access.log.txt', contents: ['text copy'] },
                            { file: 'api/20260801-1200-01-access.log.gz', contents: ['rotated compressed line'] },
                        ]
                    }
                });
            }

            return Promise.resolve({
                response: {
                    data: [
                        { file: 'api/access.log', contents: ['current access'] },
                        { file: 'api/error.log', contents: ['current error'] },
                        { file: 'api/queue.log', contents: ['queue bridge'] },
                        { file: 'api/access.log.txt', contents: ['text copy'] },
                        { file: 'api/20260801-1200-01-access.log.gz', contents: ['rotated compressed line'] },
                    ]
                }
            });
        });

        render(<LogExplorer router={router} refreshToken={0} />);

        await waitFor(() => {
            expect(screen.getByLabelText('Log File')).toBeInTheDocument();
        });

        const fileSelector = screen.getByLabelText('Log File');
        let optionValues = [];

        await waitFor(() => {
            optionValues = Array.from(fileSelector.querySelectorAll('option')).map(item => item.textContent || '');
            expect(optionValues.length).toBeGreaterThan(1);
        });

        expect(optionValues.some(value => value.includes('access.log'))).toBe(true);
        expect(optionValues.some(value => value.includes('error.log'))).toBe(true);
        expect(optionValues.some(value => value.includes('queue.log'))).toBe(true);
        expect(optionValues.some(value => value.includes('access.log.txt'))).toBe(true);
        expect(optionValues.some(value => value.includes('20260801-1200-01-access.log.gz'))).toBe(true);
        expect(optionValues.some(value => value.includes('(API)'))).toBe(true);

        fireEvent.change(fileSelector, { target: { value: 'api/20260801-1200-01-access.log.gz' } });

        await waitFor(() => {
            expect(screen.getByText(/File: api\/20260801-1200-01-access.log.gz/i)).toBeInTheDocument();
        });
    });
});
