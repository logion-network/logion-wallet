jest.mock('./logion-chain');
jest.mock('./config');

import React from 'react';
import { render, screen } from '@testing-library/react';
import renderer from 'react-test-renderer';
import App from './App';
import { setContextMock } from './logion-chain';

test('Initially connecting to API', () => {
    setContextMock({
        apiState: 'CONNECT_INIT'
    });
    const component = renderer.create(<App />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
