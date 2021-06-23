jest.mock('../UserContext');
jest.mock('../../RootContext');

import { setPendingProtectionRequests, setAcceptedProtectionRequests, setRecoveryConfig } from "../UserContext";
import { shallowRender } from "../../tests";
import React from "react";
import RecoveryStatus from "./RecoveryStatus";
import { ProtectionRequest } from '../../legal-officer/Types';
import { RECOVERY_REQUEST } from './TestData';

test("renders empty", () => {
    const tree = shallowRender(<RecoveryStatus/>)
    expect(tree).toMatchSnapshot();
});

test("renders pending protection request", () => {
    const requests: ProtectionRequest[] = [
        RECOVERY_REQUEST
    ];
    setPendingProtectionRequests(requests);
    setAcceptedProtectionRequests([]);
    setRecoveryConfig({ isEmpty: true });

    const tree = shallowRender(<RecoveryStatus/>)

    expect(tree).toMatchSnapshot();
});

test("renders accepted protection request", () => {
    setPendingProtectionRequests([]);
    const requests: ProtectionRequest[] = [
        RECOVERY_REQUEST
    ];
    setAcceptedProtectionRequests(requests);
    setRecoveryConfig({ isEmpty: true });

    const tree = shallowRender(<RecoveryStatus/>)

    expect(tree).toMatchSnapshot();
});

test("renders protected", () => {
    setPendingProtectionRequests([]);
    const requests: ProtectionRequest[] = [
        RECOVERY_REQUEST
    ];
    setAcceptedProtectionRequests(requests);
    setRecoveryConfig({ isEmpty: false });

    const tree = shallowRender(<RecoveryStatus />)

    expect(tree).toMatchSnapshot();
});
