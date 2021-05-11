import React from 'react';
import LegalOfficerWallet from './LegalOfficerWallet';
import { shallowRender } from './tests';

test('renders', () => {
    const tree = shallowRender(<LegalOfficerWallet />);
    expect(tree).toMatchSnapshot();
});
