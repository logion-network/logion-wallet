jest.mock("../common/RootContext");

import React from 'react';
import RecoveryRequests from './RecoveryRequests';
import { shallowRender } from '../tests';

test('renders', () => {
    const tree = shallowRender(<RecoveryRequests />);
    expect(tree).toMatchSnapshot();
});
