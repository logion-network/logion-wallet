import React from 'react';
import Logo from './Logo';
import { render } from './tests';

test('renders', () => {
    const tree = render(<Logo size={100} />);
    expect(tree).toMatchSnapshot();
});
