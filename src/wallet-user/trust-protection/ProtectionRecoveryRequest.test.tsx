jest.mock('../UserContext');
jest.mock('../../logion-chain');
jest.mock('../../RootContext');
jest.mock('../../logion-chain/Signature');
jest.mock('../../logion-chain/Recovery');

import React from 'react';

import { shallowRender } from "../../tests";
import moment from 'moment';
import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRecovery } from '../../logion-chain/Recovery';

import ProtectionRecoveryRequest from './ProtectionRecoveryRequest';
import { ProtectionRequest } from '../../legal-officer/Types';
import { DEFAULT_IDENTITY, DEFAULT_ADDRESS } from '../../component/TestData';
import { TEST_WALLET_USER } from "../TestData";
import {
    ACTIVATED_PROTECTION_REQUEST,
    PENDING_PROTECTION_REQUEST,
    ACTIVATED_RECOVERY_REQUEST,
    PENDING_RECOVERY_REQUEST,
    PROTECTION_REQUEST,
    RECOVERY_REQUEST,
} from './TestData';
import { setRecoveryConfig } from '../__mocks__/UserContextMock';

test("activated protection request", () => {
    const tree = shallowRender(<ProtectionRecoveryRequest request={ ACTIVATED_PROTECTION_REQUEST } type='activated'/>)
    expect(tree).toMatchSnapshot();
});

test("pending protection request", () => {
    const tree = shallowRender(<ProtectionRecoveryRequest request={ PENDING_PROTECTION_REQUEST } type='activated'/>)
    expect(tree).toMatchSnapshot();
});

test("activated recovery request", () => {
    const tree = shallowRender(<ProtectionRecoveryRequest request={ ACTIVATED_RECOVERY_REQUEST } type='activated'/>)
    expect(tree).toMatchSnapshot();
});

test("pending recovery request", () => {
    const tree = shallowRender(<ProtectionRecoveryRequest request={ PENDING_RECOVERY_REQUEST } type='activated'/>)
    expect(tree).toMatchSnapshot();
});

test("Activation of accepted protection request", async () => {
    const requester = TEST_WALLET_USER;
    const legalOfficers = ['5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'];
    const request: ProtectionRequest = {
        id: '2eb5f71c-7f31-44b5-9390-c3bf56501880',
        requesterAddress: requester,
        decisions: [
            {
                legalOfficerAddress: legalOfficers[0],
                status: 'ACCEPTED',
                rejectReason: null,
                decisionOn: null
            },
            {
                legalOfficerAddress: legalOfficers[1],
                status: 'ACCEPTED',
                rejectReason: null,
                decisionOn: null
            }
        ],
        userIdentity: DEFAULT_IDENTITY,
        userPostalAddress: DEFAULT_ADDRESS,
        createdOn: moment('2021-06-10T13:48:00.000Z').toISOString(),
        isRecovery: false,
        addressToRecover: null,
        status: "PENDING",
    };

    render(<ProtectionRecoveryRequest request={ request } type='accepted' />);
    const activateButton = screen.getByRole('button', {name: "Activate"});
    userEvent.click(activateButton);

    await waitFor(() => expect(createRecovery).toBeCalledWith(expect.objectContaining({
        api: expect.anything(),
        signerId: requester,
        callback: expect.anything(),
        errorCallback: expect.anything(),
        legalOfficers,
    })));
});

test("protection request", () => {
    const tree = shallowRender(<ProtectionRecoveryRequest request={ PROTECTION_REQUEST } type='pending' />)
    expect(tree).toMatchSnapshot();
});

test("recovery request", () => {
    const tree = shallowRender(<ProtectionRecoveryRequest request={ RECOVERY_REQUEST } type='pending' />)
    expect(tree).toMatchSnapshot();
});
