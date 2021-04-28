import React from 'react';
import CreateAccount from './CreateAccount';
import { shallowRender } from './tests';

test('renders', () => {
    const tree = shallowRender(<CreateAccount />);
    expect(tree).toMatchSnapshot();
});
