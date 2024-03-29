jest.mock("../logion-chain");
jest.mock("../common/CommonContext");

import LegalOfficerDashboard from './LegalOfficerDashboard';
import { DEFAULT_LEGAL_OFFICER } from "../common/TestData";
import { shallowRender, mockAccount } from '../tests';
import { setContextMock } from '../logion-chain/__mocks__/LogionChainMock';
import { DEFAULT_LEGAL_OFFICER_ACCOUNT, setCurrentAddress } from '../logion-chain/__mocks__/LogionChainMock';

test('renders', () => {
    setContextMock({
        injectedAccounts: [
            mockAccount(DEFAULT_LEGAL_OFFICER.address, "Account name")
        ]
    });
    setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    const tree = shallowRender(<LegalOfficerDashboard />);
    expect(tree).toMatchSnapshot();
});
