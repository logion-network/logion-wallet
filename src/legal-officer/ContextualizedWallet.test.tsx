jest.mock("../logion-chain");
jest.mock("../common/RootContext");

import React from 'react';
import ContextualizedWallet from './ContextualizedWallet';
import { DEFAULT_LEGAL_OFFICER } from '../common/types/LegalOfficer';
import { shallowRender, mockAccount } from '../tests';
import { setContextMock } from '../logion-chain/__mocks__/LogionChainMock';

test('renders', () => {
    setContextMock({
        injectedAccounts: [
            mockAccount(DEFAULT_LEGAL_OFFICER, "Account name")
        ]
    });
    const tree = shallowRender(<ContextualizedWallet />);
    expect(tree).toMatchSnapshot();
});
