jest.mock("../RootContext");
jest.mock("./Model");
jest.mock("./LegalOfficerContext");
jest.mock("../logion-chain");
jest.mock('../logion-chain/Signature');
jest.mock("../logion-chain/Recovery");

import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecoveryDetails from './RecoveryDetails';
import { RecoveryInfo } from './Types';
import { setFetchRecoveryInfo, acceptProtectionRequest, rejectProtectionRequest } from './__mocks__/ModelMock';
import { PROTECTION_REQUESTS_HISTORY, DEFAULT_LEGAL_OFFICER_ADDRESS } from './TestData';
import { setAddresses } from '../__mocks__/RootContextMock';
import { setIsFinalized } from '../logion-chain/__mocks__/SignatureMock';
import { setParams, history } from '../__mocks__/ReactRouterMock';
import { ISO_DATETIME_PATTERN } from '../logion-chain/datetime';
import { refreshRequests } from './__mocks__/LegalOfficerContextMock';

test("Recovery requires acceptance and vouching", async () => {
    setAddresses({
        currentAddress: DEFAULT_LEGAL_OFFICER_ADDRESS,
        addresses: [ DEFAULT_LEGAL_OFFICER_ADDRESS],
    });
    const protectionRequest = PROTECTION_REQUESTS_HISTORY[0];
    const recoveryConfig: RecoveryInfo = {
        accountToRecover: protectionRequest,
        recoveryAccount: protectionRequest,
    };
    setFetchRecoveryInfo(jest.fn().mockResolvedValue(recoveryConfig));
    setIsFinalized(false);
    setParams({ requestId: protectionRequest.id });

    render(<RecoveryDetails />);

    let processButton: HTMLElement;
    await waitFor(() => processButton = screen.getByRole("button", {name: "Proceed"}));
    userEvent.click(processButton!);

    let confirmButton: HTMLElement;
    await waitFor(() => confirmButton = screen.getByRole("button", {name: "Confirm and sign"}));
    userEvent.click(confirmButton!);

    await waitFor(() => expect(acceptProtectionRequest).toBeCalledWith(expect.objectContaining({
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER_ADDRESS.address,
        requestId: protectionRequest.id,
        signature: expect.stringMatching(new RegExp("protection-request,accept," + ISO_DATETIME_PATTERN.source + ",1")),
        signedOn: expect.anything(),
    })));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent("Submitting..."));
});

test("Recovery can be refused", async () => {
    setAddresses({
        currentAddress: DEFAULT_LEGAL_OFFICER_ADDRESS,
        addresses: [ DEFAULT_LEGAL_OFFICER_ADDRESS],
    });
    const protectionRequest = PROTECTION_REQUESTS_HISTORY[0];
    const recoveryConfig: RecoveryInfo = {
        accountToRecover: protectionRequest,
        recoveryAccount: protectionRequest,
    };
    setFetchRecoveryInfo(jest.fn().mockResolvedValue(recoveryConfig));
    setIsFinalized(false);
    setParams({ requestId: protectionRequest.id });

    render(<RecoveryDetails />);

    let processButton: HTMLElement;
    await waitFor(() => processButton = screen.getByRole("button", {name: "Refuse"}));
    userEvent.click(processButton!);

    let confirmButton: HTMLElement;
    await waitFor(() => confirmButton = screen.getByRole("button", {name: "Refuse"}));
    userEvent.click(confirmButton!);

    await waitFor(() => expect(rejectProtectionRequest).toBeCalledWith(expect.objectContaining({
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER_ADDRESS.address,
        requestId: protectionRequest.id,
        signature: expect.stringMatching(new RegExp("protection-request,reject," + ISO_DATETIME_PATTERN.source + ",1")),
        signedOn: expect.anything(),
    })));
    await waitFor(() => expect(refreshRequests).toBeCalled());
    await waitFor(() => expect(history.push).toBeCalledWith("/legal-officer/recovery"));
});
