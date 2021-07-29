jest.mock("../common/RootContext");
jest.mock('./LegalOfficerContext');

import { ProtectionRequest } from "../common/types/ModelTypes";
import React from 'react';
import ProtectedUsers from "./ProtectedUsers";
import { shallowRender } from '../tests';
import moment from "moment";
import { setActivatedProtectionRequests } from "./__mocks__/LegalOfficerContextMock";

test('renders one row', () => {
    setActivatedProtectionRequests([
        request('2eb5f71c-7f31-44b5-9390-c3bf56501880')
    ]);
    const tree = shallowRender(<ProtectedUsers />);
    expect(tree).toMatchSnapshot();
});

test('renders 2 rows', () => {
    setActivatedProtectionRequests([
        request('2eb5f71c-7f31-44b5-9390-c3bf56501880'),
        request('9296d068-613f-4b53-9d45-d9cd494d2a45')
    ]);
    const tree = shallowRender(<ProtectedUsers />);
    expect(tree).toMatchSnapshot();
});

function request(id: string): ProtectionRequest {
    return  {
        id,
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
        userIdentity: {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@logion.network",
            phoneNumber: "+1234",
        },
        userPostalAddress: {
            line1: "Place de le République Française, 10",
            line2: "boite 15",
            postalCode: "4000",
            city: "Liège",
            country: "Belgium",
        },
        isRecovery: false,
        addressToRecover: "",
        status: "PENDING",
        createdOn: moment('2021-06-10T13:48:00.000Z').toISOString(),
    };
}
