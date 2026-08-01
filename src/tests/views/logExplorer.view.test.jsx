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
            expect(screen.getByText(/Queue log endpoint not enabled yet./i)).toBeInTheDocument();
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
});
