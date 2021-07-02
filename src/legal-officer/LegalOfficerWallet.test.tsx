jest.mock("../logion-chain");

import React from 'react';
import LegalOfficerWallet from './LegalOfficerWallet';
import { DEFAULT_LEGAL_OFFICER } from './Types';
import { shallowRender, mockAccount } from '../tests';
import { setContextMock } from '../logion-chain/__mocks__/LogionChainMock';

test('renders', () => {
    setContextMock({
        injectedAccounts: [
            mockAccount(DEFAULT_LEGAL_OFFICER, "Account name")
        ]
    });
    const tree = shallowRender(<LegalOfficerWallet />);
    expect(tree).toMatchSnapshot();
});
