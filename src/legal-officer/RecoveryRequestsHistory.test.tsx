jest.mock('./LegalOfficerContext');
jest.mock('@logion/node-api');
jest.mock('./Model');

import { shallowRender } from '../tests';
import RecoveryRequestsHistory from './RecoveryRequestsHistory';
import { setRecoveryRequestsHistory } from './__mocks__/LegalOfficerContextMock';
import { RECOVERY_REQUESTS_HISTORY } from './TestData';

test("Renders null with no data", () => {
    const tree = shallowRender(<RecoveryRequestsHistory />);
    expect(tree).toMatchSnapshot();
});

test("Renders requests history", () => {
    setRecoveryRequestsHistory(RECOVERY_REQUESTS_HISTORY);
    const tree = shallowRender(<RecoveryRequestsHistory />);
    expect(tree).toMatchSnapshot();
});
