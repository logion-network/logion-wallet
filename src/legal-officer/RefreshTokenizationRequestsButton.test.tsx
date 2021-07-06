jest.mock('./LegalOfficerContext');

import RefreshTokenizationRequestsButton from './RefreshTokenizationRequestsButton';
import { shallowRender } from '../tests';
import { setRefreshRequests } from './__mocks__/LegalOfficerContextMock';

test("Renders null with no data", () => {
    setRefreshRequests(null);
    const tree = shallowRender(<RefreshTokenizationRequestsButton />);
    expect(tree).toMatchSnapshot();
});

test("Renders with refreshRequests", () => {
    const refreshRequests = jest.fn();
    setRefreshRequests(refreshRequests);
    const tree = shallowRender(<RefreshTokenizationRequestsButton />);
    expect(tree).toMatchSnapshot();
});
