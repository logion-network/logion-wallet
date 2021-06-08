jest.mock('./LegalOfficerContext');
jest.mock('../logion-chain');
jest.mock('./Model');

import { shallowRender } from '../tests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';
import { setProtectionRequestsHistory } from './LegalOfficerContext';

test("Renders null with no data", () => {
    const tree = shallowRender(<ProtectionRequestsHistory />);
    expect(tree).toMatchSnapshot();
});

test("Renders requests history", () => {
    setProtectionRequestsHistory([
        {
            id: "1"
        }
    ]);
    const tree = shallowRender(<ProtectionRequestsHistory />);
    expect(tree).toMatchSnapshot();
});
