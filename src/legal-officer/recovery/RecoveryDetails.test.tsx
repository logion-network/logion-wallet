jest.mock('../../logion-chain/Signature');
jest.mock("../../common/CommonContext");
jest.mock("../Model");
jest.mock("../LegalOfficerContext");
jest.mock("../../logion-chain");

import { LegalOfficerCase, ValidAccountId } from "@logion/node-api";
import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RecoveryDetails from './RecoveryDetails';
import { acceptAccountRecoveryRequest, rejectAccountRecoveryRequest, setFetchRecoveryInfo } from '../__mocks__/ModelMock';
import { RECOVERY_REQUESTS_HISTORY } from '../TestData';
import { axiosMock, setAddresses, DEFAULT_LEGAL_OFFICER_ACCOUNT } from '../../logion-chain/__mocks__/LogionChainMock';
import { setParams, navigate } from '../../__mocks__/ReactRouterMock';
import { refreshRequests } from '../__mocks__/LegalOfficerContextMock';
import { It, Mock } from 'moq.ts';
import { setupApiMock } from '../../__mocks__/LogionMock';
import { RecoveryInfo } from "../Model";

describe("RecoveryDetails", () => {

    it("Recovery requires acceptance and vouching", async () => {
        setAddresses({
            current: DEFAULT_LEGAL_OFFICER_ACCOUNT,
            all: [ DEFAULT_LEGAL_OFFICER_ACCOUNT],
        });
        const protectionRequest = RECOVERY_REQUESTS_HISTORY[0];
        const recoveryConfig: RecoveryInfo = {
            type: "ACCOUNT",
            identity1: {
                userIdentity: protectionRequest.userIdentity,
                userPostalAddress: protectionRequest.userPostalAddress,
            },
            identity2: {
                userIdentity: protectionRequest.userIdentity,
                userPostalAddress: protectionRequest.userPostalAddress,
            },
            accountRecovery: {
                address1: protectionRequest.addressToRecover!,
                address2: protectionRequest.requesterAddress,
            },
        };
        setFetchRecoveryInfo(jest.fn().mockResolvedValue(recoveryConfig));
        setParams({ requestId: protectionRequest.id });
        setupApiMock(api => {
            api.setup(instance => instance.queries.getActiveRecovery(It.IsAny(), It.IsAny())).returnsAsync(undefined);
            const loc = new Mock<LegalOfficerCase>();
            loc.setup(instance => instance.closed).returns(true);
            loc.setup(instance => instance.locType).returns("Identity");
            loc.setup(instance => instance.requesterAccountId).returns(ValidAccountId.polkadot(protectionRequest.requesterAddress));
            api.setup(instance => instance.queries.getLegalOfficerCase(It.IsAny())).returnsAsync(loc.object());

            const submittable = new Mock<SubmittableExtrinsic<"promise">>();
            api.setup(instance => instance.polkadot.tx.recovery.vouchRecovery(It.IsAny(), It.IsAny())).returns(submittable.object());
        });

        render(<RecoveryDetails />);

        let processButton: HTMLElement;
        await waitFor(() => processButton = screen.getByRole("button", {name: "Proceed"}));
        await userEvent.click(processButton!);

        await waitFor(() => expect(acceptAccountRecoveryRequest).toHaveBeenCalledWith(
            axiosMock.object(),
            expect.objectContaining({
                requestId: protectionRequest.id,
            })
        ));
    });

    it("Recovery can be refused", async () => {
        setAddresses({
            current: DEFAULT_LEGAL_OFFICER_ACCOUNT,
            all: [ DEFAULT_LEGAL_OFFICER_ACCOUNT],
        });
        const protectionRequest = RECOVERY_REQUESTS_HISTORY[0];
        const recoveryConfig: RecoveryInfo = {
            type: "ACCOUNT",
            identity1: {
                userIdentity: protectionRequest.userIdentity,
                userPostalAddress: protectionRequest.userPostalAddress,
            },
            identity2: {
                userIdentity: protectionRequest.userIdentity,
                userPostalAddress: protectionRequest.userPostalAddress,
            },
            accountRecovery: {
                address1: protectionRequest.addressToRecover!,
                address2: protectionRequest.requesterAddress,
            },
        };
        setFetchRecoveryInfo(jest.fn().mockResolvedValue(recoveryConfig));
        setParams({ requestId: protectionRequest.id, type: "ACCOUNT" });

        render(<RecoveryDetails />);

        let processButton: HTMLElement;
        await waitFor(() => processButton = screen.getAllByRole("button", {name: "Refuse"})[0]);
        await userEvent.click(processButton!);

        let confirmButton: HTMLElement;
        await waitFor(() => confirmButton = screen.getAllByRole("button", {name: "Refuse"})[1]);
        await userEvent.click(confirmButton!);

        await waitFor(() => expect(rejectAccountRecoveryRequest).toHaveBeenCalledWith(axiosMock.object(), expect.objectContaining({
            requestId: protectionRequest.id,
            rejectReason: "",
        })));
        await waitFor(() => expect(refreshRequests).toHaveBeenCalled());
        await waitFor(() => expect(navigate).toHaveBeenCalledWith("/legal-officer/recovery"));
    });
});
