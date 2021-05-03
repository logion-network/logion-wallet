import React from 'react';
import Loader from './Loader';
import { render } from './tests';

test('renders', () => {
    const tree = render(<Loader text="test" />);
    expect(tree).toMatchSnapshot();
});
