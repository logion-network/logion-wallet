jest.mock('../UserContext');

import {shallowRender} from "../../tests";
import Recovery from "./Recovery";
import { setPendingProtectionRequests, setAcceptedProtectionRequests, setRecoveryConfig } from '../__mocks__/UserContextMock';
import { PENDING_RECOVERY_REQUESTS, ACCEPTED_RECOVERY_REQUESTS, ACTIVATED_RECOVERY_REQUESTS } from "./TestData";

test("renders", () => {
    const tree = shallowRender(<Recovery />)
    expect(tree).toMatchSnapshot();
});

test("renders pending protection request", () => {
    setPendingProtectionRequests(PENDING_RECOVERY_REQUESTS);
    setAcceptedProtectionRequests([]);
    setRecoveryConfig({ isEmpty: true });

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});

test("renders accepted protection request", () => {
    setPendingProtectionRequests([]);
    setAcceptedProtectionRequests(ACCEPTED_RECOVERY_REQUESTS);
    setRecoveryConfig({ isEmpty: true });

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});

test("renders protected", () => {
    setPendingProtectionRequests([]);
    setAcceptedProtectionRequests(ACTIVATED_RECOVERY_REQUESTS);
    setRecoveryConfig({ isEmpty: false });

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});
