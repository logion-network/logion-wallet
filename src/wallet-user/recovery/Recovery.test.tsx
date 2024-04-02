jest.mock('../UserContext');
jest.unmock("@logion/client");

import {shallowRender} from "../../tests";
import Recovery from "./Recovery";
import { setProtectionState } from '../__mocks__/UserContextMock';
import { PENDING_RECOVERY_REQUESTS, ACCEPTED_RECOVERY_REQUESTS, ACTIVATED_RECOVERY_REQUESTS } from "../protection/TestData";
import { PendingProtection, AcceptedProtection, PendingRecovery, ClaimedRecovery } from "@logion/client";
import { RecoverySharedState } from "@logion/client/dist/Recovery.js";
import { GUILLAUME, PATRICK } from "../../common/TestData";

test("renders", () => {
    setProtectionState(undefined);
    const tree = shallowRender(<Recovery />)
    expect(tree).toMatchSnapshot();
});

test("renders pending protection request", () => {
    setProtectionState(new PendingProtection({
        pendingProtectionRequests: PENDING_RECOVERY_REQUESTS,
        acceptedProtectionRequests: [],
        allRequests: PENDING_RECOVERY_REQUESTS,
        selectedLegalOfficers: [ PATRICK, GUILLAUME ]
    } as unknown as RecoverySharedState));

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});

test("renders accepted protection request", () => {
    setProtectionState(new AcceptedProtection({
        pendingProtectionRequests: [],
        acceptedProtectionRequests: ACCEPTED_RECOVERY_REQUESTS,
        allRequests: ACCEPTED_RECOVERY_REQUESTS,
        selectedLegalOfficers: [ PATRICK, GUILLAUME ]
    } as unknown as RecoverySharedState));

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});

test("renders protected but not claimed", () => {
    setProtectionState(new PendingRecovery({
        pendingProtectionRequests: [],
        acceptedProtectionRequests: ACCEPTED_RECOVERY_REQUESTS,
        allRequests: ACCEPTED_RECOVERY_REQUESTS,
        selectedLegalOfficers: [ PATRICK, GUILLAUME ],
        recoveryConfig: {
            legalOfficers: [ PATRICK.address, GUILLAUME.address ]
        }
    } as unknown as RecoverySharedState));

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});

test("renders protected and claimed", () => {
    setProtectionState(new ClaimedRecovery({
        pendingProtectionRequests: [],
        acceptedProtectionRequests: ACCEPTED_RECOVERY_REQUESTS,
        allRequests: ACCEPTED_RECOVERY_REQUESTS,
        selectedLegalOfficers: [ PATRICK, GUILLAUME ],
        recoveryConfig: {
            legalOfficers: [ PATRICK.address, GUILLAUME.address ]
        },
        recoveredAddress: ACTIVATED_RECOVERY_REQUESTS[0].addressToRecover!
    } as unknown as RecoverySharedState));

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});
