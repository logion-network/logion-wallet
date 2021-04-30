import React from 'react';
import Shell from './Shell';
import {shallowRender} from './tests';

test('renders', () => {
    const tree = shallowRender(
        <Shell>
            <p>Some text</p>
            <a href="https://logion.network/">A link</a>
        </Shell>
    );
    expect(tree).toMatchSnapshot();
});
