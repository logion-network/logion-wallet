jest.mock('../UserContext');

import {shallowRender} from "../../tests";
import Recovery from "./Recovery";
import { setPendingProtectionRequests, setAcceptedProtectionRequests, setRecoveryConfig, setRecoveredAddress } from '../__mocks__/UserContextMock';
import { PENDING_RECOVERY_REQUESTS, ACCEPTED_RECOVERY_REQUESTS, ACTIVATED_RECOVERY_REQUESTS } from "./TestData";

test("renders", () => {
    const tree = shallowRender(<Recovery />)
    expect(tree).toMatchSnapshot();
});

test("renders pending protection request", () => {
    setPendingProtectionRequests(PENDING_RECOVERY_REQUESTS);
    setAcceptedProtectionRequests([]);
    setRecoveryConfig(undefined);

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});

test("renders accepted protection request", () => {
    setPendingProtectionRequests([]);
    setAcceptedProtectionRequests(ACCEPTED_RECOVERY_REQUESTS);
    setRecoveryConfig(undefined);

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});

test("renders protected but not claimed", () => {
    setPendingProtectionRequests([]);
    setAcceptedProtectionRequests(ACTIVATED_RECOVERY_REQUESTS);
    setRecoveryConfig({ legalOfficers: [ "" ] });

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});

test("renders protected and claimed", () => {
    setPendingProtectionRequests([]);
    setAcceptedProtectionRequests(ACTIVATED_RECOVERY_REQUESTS);
    setRecoveryConfig({ legalOfficers: [ "" ] });
    setRecoveredAddress(ACTIVATED_RECOVERY_REQUESTS[0].addressToRecover!);

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});
