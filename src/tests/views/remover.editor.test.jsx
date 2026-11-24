import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Remover from '../../components/editors/remover.editor';

const mockRemove = jest.fn();
const mockRefresh = jest.fn();
jest.mock('../../providers/router.provider.client', () => ({ useRouter: () => ({ remove: mockRemove }) }));
jest.mock('../../providers/data.provider.client', () => ({ useData: () => ({ refresh: mockRefresh }) }));
jest.mock('../../providers/nav.provider.client', () => ({ useNav: () => ({ refresh: mockRefresh }) }));
jest.mock('../../providers/dialog.provider.client', () => ({ useDialog: () => ({ hidden: false }) }));
jest.mock('../../services/schema.services.client', () => ({ getModelLabel: () => 'Capture' }));
jest.mock('../../components/views/metadata.view', () => () => <div>Metadata</div>);
jest.mock('../../components/common/accordion', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/common/message', () => ({ UserMessage: ({ message }) => <div>{message?.msg}</div> }));
jest.mock('../../components/common/button', () => ({ label, icon, spin, disabled, onClick }) =>
    <button disabled={disabled} onClick={onClick} data-icon={icon} data-spin={spin}>{label}</button>);

beforeEach(() => jest.clearAllMocks());

test('shows a spinning disabled button throughout deletion and submits only once', async () => {
    let complete;
    mockRemove.mockImplementation((id, model, callback) => new Promise(resolve => {
        complete = () => {
            callback({ success: true, response: { message: { msg: 'Deleted', type: 'success' } } });
            resolve({ error: null, response: {} });
        };
    }));
    render(<Remover id={'123'} model={'historic_captures'} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getByRole('status')).toHaveTextContent('Deleting Capture');
    const button = screen.getByText('Deleting...');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-icon', 'spinner');
    expect(button).toHaveAttribute('data-spin', 'true');
    expect(screen.getByText('Cancel')).toBeDisabled();
    fireEvent.click(button);
    expect(mockRemove).toHaveBeenCalledTimes(1);
    await act(async () => complete());
    expect(screen.getByText('Deleted')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    expect(mockRefresh).toHaveBeenCalledTimes(2);
});

test('server rejection displays its message and allows retry without refreshing data', async () => {
    mockRemove.mockImplementation(async (id, model, callback) => {
        callback({ success: false, response: { message: { msg: 'Cannot delete capture' } } });
        return { error: { msg: 'Cannot delete capture' } };
    });
    render(<Remover id={'123'} model={'modern_captures'} />);
    fireEvent.click(screen.getByText('Delete'));
    await screen.findByText('Cannot delete capture');
    expect(screen.getByText('Delete')).toBeEnabled();
    expect(mockRefresh).not.toHaveBeenCalled();
});

test.each([
    ['network failure', () => Promise.reject(new Error('Network error')), 'Network error'],
    ['offline API', () => Promise.resolve(null), 'Unable to delete this record. The API may be unavailable.'],
])('%s releases loading and permits retry', async (name, implementation, message) => {
    mockRemove.mockImplementation(implementation);
    render(<Remover id={'123'} model={'modern_captures'} />);
    fireEvent.click(screen.getByText('Delete'));
    await screen.findByText(message);
    expect(screen.getByText('Delete')).toBeEnabled();
    expect(screen.getByText('Cancel')).toBeEnabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
