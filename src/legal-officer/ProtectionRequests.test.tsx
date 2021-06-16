jest.mock("../RootContext");

import React from 'react';
import ProtectionRequests from './ProtectionRequests';
import { shallowRender } from '../tests';

test('renders', () => {
    const tree = shallowRender(<ProtectionRequests />);
    expect(tree).toMatchSnapshot();
});
