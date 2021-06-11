jest.mock('./LegalOfficerContext');
jest.mock('../logion-chain');
jest.mock('./Model');

import { shallowRender } from '../tests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';
import { setProtectionRequestsHistory } from './LegalOfficerContext';
import { PROTECTION_REQUESTS_HISTORY } from './TestData';

test("Renders null with no data", () => {
    const tree = shallowRender(<ProtectionRequestsHistory />);
    expect(tree).toMatchSnapshot();
});

test("Renders requests history", () => {
    setProtectionRequestsHistory(PROTECTION_REQUESTS_HISTORY);
    const tree = shallowRender(<ProtectionRequestsHistory />);
    expect(tree).toMatchSnapshot();
});
