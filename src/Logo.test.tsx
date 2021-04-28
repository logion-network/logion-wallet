import React from 'react';
import Logo from './Logo';
import { render } from './tests';

test('renders', () => {
    const tree = render(<Logo />);
    expect(tree).toMatchSnapshot();
});
