jest.mock('../UserContext');
jest.mock('../../common/CommonContext');
jest.unmock('@logion/client');

import { setProtectionState } from "../__mocks__/UserContextMock";
import { shallowRender } from "../../tests";
import TrustProtection from "./TrustProtection";
import { PENDING_PROTECTION_REQUESTS, ACCEPTED_PROTECTION_REQUESTS, ACTIVATED_PROTECTION_REQUESTS } from './TestData';
import { PendingProtection, AcceptedProtection, ActiveProtection } from "@logion/client";
import { RecoverySharedState } from "@logion/client/dist/Recovery";
import { GUILLAUME, PATRICK } from "src/common/TestData";

test("renders empty", () => {
    setProtectionState(undefined);
    const tree = shallowRender(<TrustProtection/>)
    expect(tree).toMatchSnapshot();
});

test("renders pending protection request", () => {
    const protectionState = new PendingProtection({
        pendingProtectionRequests: PENDING_PROTECTION_REQUESTS,
        acceptedProtectionRequests: [],
        allRequests: PENDING_PROTECTION_REQUESTS,
        selectedLegalOfficers: [ PATRICK, GUILLAUME ]
    } as unknown as RecoverySharedState);
    setProtectionState(protectionState);

    const tree = shallowRender(<TrustProtection/>)

    expect(tree).toMatchSnapshot();
});

test("renders accepted protection request", () => {
    const protectionState = new AcceptedProtection({
        pendingProtectionRequests: [],
        acceptedProtectionRequests: ACCEPTED_PROTECTION_REQUESTS,
        allRequests: ACCEPTED_PROTECTION_REQUESTS,
        selectedLegalOfficers: [ PATRICK, GUILLAUME ]
    } as unknown as RecoverySharedState);
    setProtectionState(protectionState);

    const tree = shallowRender(<TrustProtection/>)

    expect(tree).toMatchSnapshot();
});

test("renders protected", () => {
    const protectionState = new ActiveProtection({
        pendingProtectionRequests: [],
        acceptedProtectionRequests: ACTIVATED_PROTECTION_REQUESTS,
        allRequests: ACTIVATED_PROTECTION_REQUESTS,
        selectedLegalOfficers: [ PATRICK, GUILLAUME ],
        recoveryConfig: {
            legalOfficers: [ PATRICK.address, GUILLAUME.address ]
        }
    } as unknown as RecoverySharedState);
    setProtectionState(protectionState);

    const tree = shallowRender(<TrustProtection/>)

    expect(tree).toMatchSnapshot();
});
