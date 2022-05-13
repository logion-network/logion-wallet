jest.mock('@logion/node-api/dist/LogionLoc');
jest.mock('../logion-chain/Signature');
jest.mock("@logion/node-api/dist/Recovery");
jest.mock("../common/CommonContext");
jest.mock("../loc/Model");
jest.mock("./Model");
jest.mock("./LegalOfficerContext");
jest.mock("../logion-chain");

import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RecoveryDetails from './RecoveryDetails';
import { RecoveryInfo } from './Types';
import { acceptProtectionRequest, rejectProtectionRequest } from '../loc/__mocks__/ModelMock';
import { setFetchRecoveryInfo } from './__mocks__/ModelMock';
import { PROTECTION_REQUESTS_HISTORY } from './TestData';
import { axiosMock, setAddresses, DEFAULT_LEGAL_OFFICER_ACCOUNT } from '../logion-chain/__mocks__/LogionChainMock';
import { setIsSuccessful } from '../logion-chain/__mocks__/SignatureMock';
import { setParams, navigate } from '../__mocks__/ReactRouterMock';
import { refreshRequests } from './__mocks__/LegalOfficerContextMock';
import { CLOSED_IDENTITY_LOC_ID } from '../__mocks__/@logion/node-api/dist/LogionLocMock';

describe("RecoveryDetails", () => {

    it("Recovery requires acceptance and vouching", async () => {
        setAddresses({
            current: DEFAULT_LEGAL_OFFICER_ACCOUNT,
            all: [ DEFAULT_LEGAL_OFFICER_ACCOUNT],
        });
        const protectionRequest = PROTECTION_REQUESTS_HISTORY[0];
        const recoveryConfig: RecoveryInfo = {
            accountToRecover: protectionRequest,
            recoveryAccount: protectionRequest,
        };
        setFetchRecoveryInfo(jest.fn().mockResolvedValue(recoveryConfig));
        setIsSuccessful(false);
        setParams({ requestId: protectionRequest.id });

        render(<RecoveryDetails />);

        let processButton: HTMLElement;
        await waitFor(() => processButton = screen.getByRole("button", {name: "Proceed"}));
        await userEvent.click(processButton!);

        let linkButton: HTMLElement;
        await waitFor(() => linkButton = screen.getByRole("button", {name: "Link to an existing Identity LOC"}));
        await userEvent.click(linkButton!);

        let closedLocInput: HTMLElement;
        await waitFor(() => closedLocInput = screen.getByRole("textbox", {name: "Closed Identity LOC ID"}));
        await userEvent.type(closedLocInput!, CLOSED_IDENTITY_LOC_ID);

        let confirmButton: HTMLElement;
        await waitFor(() => confirmButton = screen.getByRole("button", {name: "Confirm and sign"}));
        await userEvent.click(confirmButton!);

        await waitFor(() => expect(acceptProtectionRequest).toBeCalledWith(
            axiosMock.object(),
            expect.objectContaining({
                requestId: protectionRequest.id,
            })
        ));

        await waitFor(() => expect(screen.getByText('Submitting...')).toBeInTheDocument());
    });

    it("Recovery can be refused", async () => {
        setAddresses({
            current: DEFAULT_LEGAL_OFFICER_ACCOUNT,
            all: [ DEFAULT_LEGAL_OFFICER_ACCOUNT],
        });
        const protectionRequest = PROTECTION_REQUESTS_HISTORY[0];
        const recoveryConfig: RecoveryInfo = {
            accountToRecover: protectionRequest,
            recoveryAccount: protectionRequest,
        };
        setFetchRecoveryInfo(jest.fn().mockResolvedValue(recoveryConfig));
        setIsSuccessful(false);
        setParams({ requestId: protectionRequest.id });

        render(<RecoveryDetails />);

        let processButton: HTMLElement;
        await waitFor(() => processButton = screen.getAllByRole("button", {name: "Refuse"})[0]);
        await userEvent.click(processButton!);

        let confirmButton: HTMLElement;
        await waitFor(() => confirmButton = screen.getAllByRole("button", {name: "Refuse"})[1]);
        await userEvent.click(confirmButton!);

        await waitFor(() => expect(rejectProtectionRequest).toBeCalledWith(axiosMock.object(), expect.objectContaining({
            legalOfficerAddress: DEFAULT_LEGAL_OFFICER_ACCOUNT.address,
            requestId: protectionRequest.id,
        })));
        await waitFor(() => expect(refreshRequests).toBeCalled());
        await waitFor(() => expect(navigate).toBeCalledWith("/legal-officer/recovery"));
    });
});
