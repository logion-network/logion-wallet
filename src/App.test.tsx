jest.mock('./logion-chain');
jest.mock('./config');

import React from 'react';
import App from './App';
import { setContextMock } from './logion-chain';
import { shallowRender } from './tests';

test('Initially connecting to API', () => {
    setContextMock({
        apiState: 'CONNECT_INIT'
    });

    const tree = shallowRender(<App />);

    expect(tree).toMatchSnapshot();
});
