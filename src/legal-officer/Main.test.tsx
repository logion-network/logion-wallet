jest.mock("../logion-chain");

import Main from './Main';
import { DEFAULT_LEGAL_OFFICER } from "../common/TestData";
import { shallowRender, mockAccount } from '../tests';
import { setContextMock } from '../logion-chain/__mocks__/LogionChainMock';

test('renders', () => {
    setContextMock({
        injectedAccounts: [
            mockAccount(DEFAULT_LEGAL_OFFICER.address, "Account name")
        ]
    });
    const tree = shallowRender(<Main />);
    expect(tree).toMatchSnapshot();
});
