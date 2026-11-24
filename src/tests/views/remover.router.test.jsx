import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { RouterProvider, useRouter } from '../../providers/router.provider.client';
import { makeRequest } from '../../services/api.services.client';

jest.mock('../../services/api.services.client', () => ({ makeRequest: jest.fn() }));
jest.mock('../../services/schema.services.client', () => ({ getStaticView: () => null }));
jest.mock('../../services/session.services.client', () => ({ popSessionMsg: jest.fn() }));
jest.mock('../../utils/paths.utils.client', () => ({
    createAPIURL: route => route,
    filterPath: () => '/',
    getRoot: () => '/',
    reroute: jest.fn(),
}));

test('remove invokes completion with the raw response and returns normalized result', async () => {
    const raw = { success: true, response: { message: { msg: 'Deleted' } } };
    makeRequest.mockResolvedValue(raw);
    const callback = jest.fn();
    function Consumer() {
        const router = useRouter();
        const [result, setResult] = React.useState(null);
        return <>
            <button onClick={async () => setResult(await router.remove('123', 'historic_captures', callback))}>Delete</button>
            {result && <div>{result.error === null ? result.response.message.msg : 'Error'}</div>}
        </>;
    }
    render(<RouterProvider><Consumer /></RouterProvider>);
    fireEvent.click(screen.getByText('Delete'));
    await screen.findByText('Deleted');
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(raw);
    expect(makeRequest).toHaveBeenCalledTimes(1);
    expect(makeRequest).toHaveBeenCalledWith({ url: '/historic_captures/remove/123', method: 'DELETE' });
});
