jest.mock('../UserContext');
jest.mock('../../common/CommonContext');

import { setPendingProtectionRequests, setAcceptedProtectionRequests, setRecoveryConfig } from "../__mocks__/UserContextMock";
import { shallowRender } from "../../tests";
import TrustProtection from "./TrustProtection";
import { PENDING_PROTECTION_REQUESTS, ACCEPTED_PROTECTION_REQUESTS, ACTIVATED_PROTECTION_REQUESTS } from './TestData';

test("renders empty", () => {
    const tree = shallowRender(<TrustProtection/>)
    expect(tree).toMatchSnapshot();
});

test("renders pending protection request", () => {
    setPendingProtectionRequests(PENDING_PROTECTION_REQUESTS);
    setAcceptedProtectionRequests([]);
    setRecoveryConfig({ isEmpty: true });

    const tree = shallowRender(<TrustProtection/>)

    expect(tree).toMatchSnapshot();
});

test("renders accepted protection request", () => {
    setPendingProtectionRequests([]);
    setAcceptedProtectionRequests(ACCEPTED_PROTECTION_REQUESTS);
    setRecoveryConfig({ isEmpty: true });

    const tree = shallowRender(<TrustProtection/>)

    expect(tree).toMatchSnapshot();
});

test("renders protected", () => {
    setPendingProtectionRequests([]);
    setAcceptedProtectionRequests(ACTIVATED_PROTECTION_REQUESTS);
    setRecoveryConfig({ isEmpty: false });

    const tree = shallowRender(<TrustProtection/>)

    expect(tree).toMatchSnapshot();
});
