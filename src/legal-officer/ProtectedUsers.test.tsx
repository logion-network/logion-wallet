jest.mock("../common/CommonContext");
jest.mock('./LegalOfficerContext');

import ProtectedUsers from "./ProtectedUsers";
import { shallowRender } from '../tests';
import { setActivatedProtectionRequests } from "./__mocks__/LegalOfficerContextMock";
import { ACTIVATED_PROTECTION_REQUEST1, ACTIVATED_PROTECTION_REQUEST3 } from "../wallet-user/trust-protection/TestData";

test('renders one row', () => {
    setActivatedProtectionRequests([ ACTIVATED_PROTECTION_REQUEST1 ]);
    const tree = shallowRender(<ProtectedUsers />);
    expect(tree).toMatchSnapshot();
});

test('renders 2 rows', () => {
    setActivatedProtectionRequests([ ACTIVATED_PROTECTION_REQUEST1, ACTIVATED_PROTECTION_REQUEST3 ]);
    const tree = shallowRender(<ProtectedUsers />);
    expect(tree).toMatchSnapshot();
});
