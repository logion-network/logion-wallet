jest.mock('./logion-chain');
jest.mock('./config');

import React from 'react';
import App from './App';
import { shallowRender } from './tests';

test('renders', () => {
    const tree = shallowRender(<App />);
    expect(tree).toMatchSnapshot();
});
