jest.mock('@logion/node-api/dist/Recovery');
jest.mock('../../logion-chain/Signature');
jest.mock('../../logion-chain');
jest.mock('../../common/CommonContext');
jest.mock('../UserContext');
jest.mock('./Model');

import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRecovery } from '@logion/node-api/dist/Recovery';

import { shallowRender } from "../../tests";

import ProtectionRecoveryRequest from './ProtectionRecoveryRequest';
import { TEST_WALLET_USER } from "../TestData";
import {
    ACTIVATED_PROTECTION_REQUESTS,
    PENDING_PROTECTION_REQUESTS,
    ACTIVATED_RECOVERY_REQUESTS,
    PENDING_RECOVERY_REQUESTS,
    ACCEPTED_PROTECTION_REQUESTS,
} from './TestData';

describe("ProtectionRecoveryRequest", () => {

    it("activated protection request", () => {
        const tree = shallowRender(<ProtectionRecoveryRequest requests={ ACTIVATED_PROTECTION_REQUESTS } type='activated'/>)
        expect(tree).toMatchSnapshot();
    });

    it("pending protection request", () => {
        const tree = shallowRender(<ProtectionRecoveryRequest requests={ PENDING_PROTECTION_REQUESTS } type='activated'/>)
        expect(tree).toMatchSnapshot();
    });

    it("activated recovery request", () => {
        const tree = shallowRender(<ProtectionRecoveryRequest requests={ ACTIVATED_RECOVERY_REQUESTS } type='activated'/>)
        expect(tree).toMatchSnapshot();
    });

    it("pending recovery request", () => {
        const tree = shallowRender(<ProtectionRecoveryRequest requests={ PENDING_RECOVERY_REQUESTS } type='activated'/>)
        expect(tree).toMatchSnapshot();
    });

    it("Activation of accepted protection request", async () => {
        const requester = TEST_WALLET_USER;

        render(<ProtectionRecoveryRequest requests={ ACCEPTED_PROTECTION_REQUESTS } type='accepted' />);

        const activateButton = screen.getByRole('button', {name: "Activate"});
        await userEvent.click(activateButton);

        await waitFor(() => expect(createRecovery).toBeCalledWith(
            expect.objectContaining({
                api: expect.anything(),
                legalOfficers: expect.arrayContaining(ACCEPTED_PROTECTION_REQUESTS.map(request => request.legalOfficerAddress)),
            }
        )));
    });

    it("protection request", () => {
        const tree = shallowRender(<ProtectionRecoveryRequest requests={ PENDING_PROTECTION_REQUESTS } type='pending' />)
        expect(tree).toMatchSnapshot();
    });

    it("recovery request", () => {
        const tree = shallowRender(<ProtectionRecoveryRequest requests={ PENDING_RECOVERY_REQUESTS } type='pending' />)
        expect(tree).toMatchSnapshot();
    });
});
