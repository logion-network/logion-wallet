jest.mock('../UserContext');
jest.mock('../../common/RootContext');

import React from "react";
import {shallowRender} from "../../tests";
import Recovery from "./Recovery";
import { ProtectionRequest } from "../../legal-officer/Types";
import { setPendingProtectionRequests, setAcceptedProtectionRequests, setRecoveryConfig } from '../__mocks__/UserContextMock';
import { RECOVERY_REQUEST } from "./TestData";

test("renders", () => {
    const tree = shallowRender(<Recovery />)
    expect(tree).toMatchSnapshot();
});

test("renders pending protection request", () => {
    const requests: ProtectionRequest[] = [
        RECOVERY_REQUEST
    ];
    setPendingProtectionRequests(requests);
    setAcceptedProtectionRequests([]);
    setRecoveryConfig({ isEmpty: true });

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});

test("renders accepted protection request", () => {
    setPendingProtectionRequests([]);
    const requests: ProtectionRequest[] = [
        RECOVERY_REQUEST
    ];
    setAcceptedProtectionRequests(requests);
    setRecoveryConfig({ isEmpty: true });

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});

test("renders protected", () => {
    setPendingProtectionRequests([]);
    const requests: ProtectionRequest[] = [
        RECOVERY_REQUEST
    ];
    setAcceptedProtectionRequests(requests);
    setRecoveryConfig({ isEmpty: false });

    const tree = shallowRender(<Recovery />)

    expect(tree).toMatchSnapshot();
});
