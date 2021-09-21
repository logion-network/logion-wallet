jest.mock('../common/CommonContext');

import React from 'react';
import LocRequests from './LocRequests';
import { shallowRender } from '../tests';

test('renders', () => {
    const tree = shallowRender(<LocRequests />);
    expect(tree).toMatchSnapshot();
});
