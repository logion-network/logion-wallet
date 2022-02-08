jest.mock('../../common/CommonContext');

import React from 'react';
import TransactionProtection from './TransactionProtection';
import { shallowRender } from '../../tests';

test('renders', () => {
    const tree = shallowRender(<TransactionProtection locType="Transaction"
                                                      titles={ { main: "main", loc: "loc", request: "request" } }
                                                      iconId="loc" />);
    expect(tree).toMatchSnapshot();
});
