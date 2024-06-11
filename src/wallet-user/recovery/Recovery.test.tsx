jest.mock('../UserContext');
jest.unmock("@logion/client");

import {shallowRender} from "../../tests";
import Recovery from "./Recovery";
import { setProtectionState } from '../__mocks__/UserContextMock';
import { PENDING_RECOVERY_REQUESTS, ACCEPTED_RECOVERY_REQUESTS, ACTIVATED_RECOVERY_REQUESTS } from "../protection/TestData";
import { PendingRecovery, ClaimedRecovery, ActiveRecovery } from "@logion/client";
import { ValidAccountId } from "@logion/node-api";
import { AcceptedRecovery, RecoverySharedState } from "@logion/client/dist/AccountRecovery.js";
import { GUILLAUME, PATRICK } from "../../common/TestData";

test("renders", () => {
    setProtectionState(undefined);
    const tree = shallowRender(<Recovery />)
    expect(tree).toMatchSnapshot();
});

test("renders pending protection request", () => {
    setProtectionState(new PendingRecovery({
        pendingProtectionRequests: PENDING_RECOVERY_REQUESTS,
        acceptedProtectionRequests: [],
        allRequests: PENDING_RECOVERY_REQUESTS,
        selectedLegalOfficers: [ PATRICK, GUILLAUME ],
    } as unknown as RecoverySharedState));

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});

test("renders accepted protection request", () => {
    setProtectionState(new AcceptedRecovery({
        pendingProtectionRequests: [],
        acceptedProtectionRequests: ACCEPTED_RECOVERY_REQUESTS,
        allRequests: ACCEPTED_RECOVERY_REQUESTS,
        selectedLegalOfficers: [ PATRICK, GUILLAUME ]
    } as unknown as RecoverySharedState));

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});

test("renders protected but not claimed", () => {
    setProtectionState(new ActiveRecovery({
        pendingProtectionRequests: [],
        acceptedProtectionRequests: ACCEPTED_RECOVERY_REQUESTS,
        allRequests: ACCEPTED_RECOVERY_REQUESTS,
        selectedLegalOfficers: [ PATRICK, GUILLAUME ],
        recoveryConfig: {
            legalOfficers: [ PATRICK.account, GUILLAUME.account ]
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
            legalOfficers: [ PATRICK.account, GUILLAUME.account ]
        },
        recoveredAccount: ValidAccountId.polkadot(ACTIVATED_RECOVERY_REQUESTS[0].addressToRecover!),
    } as unknown as RecoverySharedState));

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});
