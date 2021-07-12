jest.mock('./UserContext');

import RefreshRequestsButton from './RefreshRequestsButton';
import { shallowRender } from '../tests';
import { setRefreshRequests } from './__mocks__/UserContextMock';

test("Renders null with no data", () => {
    setRefreshRequests(null);
    const tree = shallowRender(<RefreshRequestsButton />);
    expect(tree).toMatchSnapshot();
});

test("Renders with refreshRequests", () => {
    const refreshRequests = jest.fn();
    setRefreshRequests(refreshRequests);
    const tree = shallowRender(<RefreshRequestsButton />);
    expect(tree).toMatchSnapshot();
});
