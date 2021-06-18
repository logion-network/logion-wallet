jest.mock('../UserContext');
jest.mock('../../RootContext');

import moment from 'moment';

import { setPendingProtectionRequests, setAcceptedProtectionRequests, setRecoveryConfig } from "../UserContext";
import { shallowRender } from "../../tests";
import React from "react";
import ProtectionRequestStatus from "./ProtectionRequestStatus";
import { ProtectionRequest } from '../../legal-officer/Types';
import { DEFAULT_IDENTITY } from '../../component/Identity.test';
import { DEFAULT_ADDRESS } from '../../component/PostalAddress.test';

test("renders empty", () => {
    const tree = shallowRender(<ProtectionRequestStatus/>)
    expect(tree).toMatchSnapshot();
});

test("renders pending protection request", () => {
    const requests: ProtectionRequest[] = [
        {
            id: '2eb5f71c-7f31-44b5-9390-c3bf56501880',
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            decisions: [
                {
                    legalOfficerAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
                    status: 'PENDING',
                    rejectReason: null,
                    decisionOn: null
                },
                {
                    legalOfficerAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
                    status: 'PENDING',
                    rejectReason: null,
                    decisionOn: null
                }
            ],
            userIdentity: DEFAULT_IDENTITY,
            userPostalAddress: DEFAULT_ADDRESS,
            createdOn: moment('2021-06-10T13:48:00.000Z').toISOString(),
        }
    ];
    setPendingProtectionRequests(requests);
    setAcceptedProtectionRequests([]);
    setRecoveryConfig({ isEmpty: true });

    const tree = shallowRender(<ProtectionRequestStatus/>)

    expect(tree).toMatchSnapshot();
});

test("renders accepted protection request", () => {
    setPendingProtectionRequests([]);
    const requests: ProtectionRequest[] = [
        {
            id: '2eb5f71c-7f31-44b5-9390-c3bf56501880',
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            decisions: [
                {
                    legalOfficerAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
                    status: 'ACCEPTED',
                    rejectReason: null,
                    decisionOn: null
                },
                {
                    legalOfficerAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
                    status: 'ACCEPTED',
                    rejectReason: null,
                    decisionOn: null
                }
            ],
            userIdentity: DEFAULT_IDENTITY,
            userPostalAddress: DEFAULT_ADDRESS,
            createdOn: moment('2021-06-10T13:48:00.000Z').toISOString(),
        }
    ];
    setAcceptedProtectionRequests(requests);
    setRecoveryConfig({ isEmpty: true });

    const tree = shallowRender(<ProtectionRequestStatus/>)

    expect(tree).toMatchSnapshot();
});

test("renders protected", () => {
    setPendingProtectionRequests([]);
    const requests: ProtectionRequest[] = [
        {
            id: '2eb5f71c-7f31-44b5-9390-c3bf56501880',
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            decisions: [
                {
                    legalOfficerAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
                    status: 'ACCEPTED',
                    rejectReason: null,
                    decisionOn: null
                },
                {
                    legalOfficerAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
                    status: 'ACCEPTED',
                    rejectReason: null,
                    decisionOn: null
                }
            ],
            userIdentity: DEFAULT_IDENTITY,
            userPostalAddress: DEFAULT_ADDRESS,
            createdOn: moment('2021-06-10T13:48:00.000Z').toISOString(),
        }
    ];
    setAcceptedProtectionRequests(requests);
    setRecoveryConfig({ isEmpty: false });

    const tree = shallowRender(<ProtectionRequestStatus/>)

    expect(tree).toMatchSnapshot();
});
