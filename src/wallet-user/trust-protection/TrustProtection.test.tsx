jest.mock('../UserContext');
jest.mock('../../common/RootContext');

import { setPendingProtectionRequests, setAcceptedProtectionRequests, setRecoveryConfig } from "../__mocks__/UserContextMock";
import { shallowRender } from "../../tests";
import React from "react";
import TrustProtection from "./TrustProtection";
import { ProtectionRequest } from '../../legal-officer/Types';
import { PROTECTION_REQUEST } from './TestData';

test("renders empty", () => {
    const tree = shallowRender(<TrustProtection/>)
    expect(tree).toMatchSnapshot();
});

test("renders pending protection request", () => {
    const requests: ProtectionRequest[] = [
        PROTECTION_REQUEST
    ];
    setPendingProtectionRequests(requests);
    setAcceptedProtectionRequests([]);
    setRecoveryConfig({ isEmpty: true });

    const tree = shallowRender(<TrustProtection/>)

    expect(tree).toMatchSnapshot();
});

test("renders accepted protection request", () => {
    setPendingProtectionRequests([]);
    const requests: ProtectionRequest[] = [
        PROTECTION_REQUEST
    ];
    setAcceptedProtectionRequests(requests);
    setRecoveryConfig({ isEmpty: true });

    const tree = shallowRender(<TrustProtection/>)

    expect(tree).toMatchSnapshot();
});

test("renders protected", () => {
    setPendingProtectionRequests([]);
    const requests: ProtectionRequest[] = [
        PROTECTION_REQUEST
    ];
    setAcceptedProtectionRequests(requests);
    setRecoveryConfig({ isEmpty: false });

    const tree = shallowRender(<TrustProtection/>)

    expect(tree).toMatchSnapshot();
});
