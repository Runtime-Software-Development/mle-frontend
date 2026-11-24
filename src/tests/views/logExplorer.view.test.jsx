import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { saveAs } from 'file-saver';
import LogExplorer from '../../components/views/logExplorer.view';

jest.mock('file-saver', () => ({ saveAs: jest.fn() }));
jest.mock('../../components/common/button', () => function MockButton({ label, onClick, disabled, spin, icon }) {
    return <button disabled={disabled} onClick={onClick} data-spin={spin} data-icon={icon}>{label}</button>;
});
jest.mock('../../components/common/message', () => ({
    UserMessage: ({ message }) => <div>{message?.msg}</div>
}));
global.ResizeObserver = class { observe() {} disconnect() {} };

const response = (data) => ({ response: { data } });
const files = [
    { source: 'api', file: 'error.log', contents: ['2026-08-01 12:00:00 ERROR first', '2026-08-01 12:00:01 ERROR second', ''] },
    { source: 'api', file: 'access.log', contents: [], missing: true },
    { source: 'queue', file: 'queue.log', contents: ['queue warning'] },
];

beforeEach(() => jest.clearAllMocks());

test('loads once and switches sources/files locally with no pod controls', async () => {
    const router = { get: jest.fn().mockResolvedValue(response(files)) };
    render(<LogExplorer router={router} />);
    await screen.findByText('2 visible lines of 2');
    expect(router.get).toHaveBeenCalledWith('/admin/logs');
    expect(screen.queryByLabelText(/Pod/)).not.toBeInTheDocument();
    expect(screen.queryByText('Load Newer')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Log File'), { target: { value: 'access.log' } });
    expect(screen.getByText('No entries since last rotation.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Source'), { target: { value: 'queue' } });
    expect(screen.getByText('queue warning')).toBeInTheDocument();
    expect(router.get).toHaveBeenCalledTimes(1);
});

test('large files stay bounded until Load Older is explicitly selected', async () => {
    const lines = Array.from({ length: 50000 }, (_, index) => `INFO line ${index}`);
    const router = { get: jest.fn().mockResolvedValue(response([{ source: 'api', file: 'error.log', contents: lines }])) };
    render(<LogExplorer router={router} />);
    await screen.findByText('1200 visible lines of 50000');
    expect(document.querySelectorAll('.log-line').length).toBeLessThan(100);
    expect(document.querySelector('.log-line-text')).toHaveTextContent('line 49999');
    fireEvent.click(screen.getByText('Load Older'));
    expect(screen.getByText('2400 visible lines of 50000')).toBeInTheDocument();
    expect(router.get).toHaveBeenCalledTimes(1);
});

test('downloads complete selected snapshot rather than filtered preview without another request', async () => {
    const lines = Array.from({ length: 1500 }, (_, index) => `line ${index}`);
    const router = { get: jest.fn().mockResolvedValue(response([{ source: 'api', file: 'error.log', contents: lines }])) };
    render(<LogExplorer router={router} />);
    await screen.findByText('1200 visible lines of 1500');
    fireEvent.change(screen.getByLabelText('Search Loaded Lines'), { target: { value: 'line 1499' } });
    fireEvent.click(screen.getByText('Download Log'));
    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'api-error.log');
    const text = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsText(saveAs.mock.calls[0][0]);
    });
    expect(text).toBe(lines.join('\n') + '\n');
    expect(router.get).toHaveBeenCalledTimes(1);
});

test('queue failures preserve backend details and can be retried', async () => {
    const router = { get: jest.fn().mockResolvedValue(response([
        ...files.slice(0, 2), { source: 'queue', file: 'queue-log-fetch-error', missing: true, details: 'Connection refused', contents: [] }
    ])) };
    render(<LogExplorer router={router} />);
    await screen.findByText('2 visible lines of 2');
    fireEvent.change(screen.getByLabelText('Source'), { target: { value: 'queue' } });
    expect(screen.getByText('Queue logs unavailable: Connection refused')).toBeInTheDocument();
    expect(screen.getByText('Download Log')).toBeDisabled();
    router.get.mockResolvedValue(response(files));
    fireEvent.click(screen.getByText('Refresh'));
    await screen.findByText('queue warning');
    expect(screen.queryByText(/Connection refused/)).not.toBeInTheDocument();
});

test('refresh replaces a snapshot rather than mixing logs from different instances', async () => {
    const router = { get: jest.fn().mockResolvedValue(response(files)) };
    render(<LogExplorer router={router} />);
    await screen.findByText('2 visible lines of 2');
    router.get.mockResolvedValue(response([{ source: 'api', file: 'error.log', contents: ['other instance'] }]));
    fireEvent.click(screen.getByText('Refresh'));
    await screen.findByText('other instance');
    expect(screen.queryByText(/ERROR second/)).not.toBeInTheDocument();
    expect(router.get).toHaveBeenCalledTimes(2);
});

test('shows loading and errors without starting concurrent requests', async () => {
    let reject;
    const router = { get: jest.fn().mockReturnValue(new Promise((resolve, fail) => { reject = fail; })) };
    render(<LogExplorer router={router} />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading logs');
    fireEvent.click(screen.getByText('Loading...'));
    expect(router.get).toHaveBeenCalledTimes(1);
    reject(new Error('Permission denied'));
    await screen.findByText('Permission denied');
    expect(screen.getByText('Refresh')).toBeEnabled();
});

test('preserves order and time/search filtering in more options', async () => {
    const router = { get: jest.fn().mockResolvedValue(response(files)) };
    render(<LogExplorer router={router} />);
    await screen.findByText('2 visible lines of 2');
    expect(document.querySelector('.log-line-text')).toHaveTextContent('second');
    fireEvent.click(screen.getByLabelText('Newest first'));
    expect(document.querySelector('.log-line-text')).toHaveTextContent('first');
    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: '2026-08-01T12:00:01' } });
    await waitFor(() => expect(screen.getByText('1 visible lines of 2')).toBeInTheDocument());
    expect(document.querySelector('.log-line-text')).toHaveTextContent('second');
});
