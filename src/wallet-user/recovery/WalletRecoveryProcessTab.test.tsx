import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, getByRole } from '@testing-library/react';
import { ValidAccountId, Fees, TypesAccountData, Lgnt } from "@logion/node-api";

import { mutateRecoveredBalanceState, setProtectionState, setRecoveredBalanceState } from '../__mocks__/UserContextMock';

import WalletRecoveryProcessTab from "./WalletRecoveryProcessTab";
import { ClaimedRecovery, ProtectionParameters, BalanceState } from '@logion/client';

jest.mock('../../logion-chain');
jest.mock('../../common/CommonContext');
jest.mock('../UserContext');

test("Recovered tokens can be transferred", async () => {
    const recoveredAccountId = ValidAccountId.polkadot("5GEZAeYtVZPEEmCT66scGoWS4Jd7AWJdXeNyvxC3LxKP8jCn");
    const protectionState = {
        protectionParameters: {
            recoveredAccount: recoveredAccountId,
        } as ProtectionParameters
    } as unknown as ClaimedRecovery;
    setProtectionState(protectionState);

    const coinBalance: TypesAccountData = {
        total: Lgnt.from(0.1),
        available: Lgnt.from(0.1),
        reserved: Lgnt.zero(),
    }

    setRecoveredBalanceState({
        balance: coinBalance,
        estimateFeesTransferAll: () => Promise.resolve(Fees.zero()),
    } as unknown as BalanceState);

    render(<WalletRecoveryProcessTab vaultFirst={ false } />);

    let transferButton: HTMLElement;
    await waitFor(() => transferButton = screen.getByRole("button", {name: "Recover"}));
    await userEvent.click(transferButton!);

    let dialog: HTMLElement;
    await waitFor(() => dialog = screen.getByRole("dialog"));
    let confirmButton: HTMLElement;
    await waitFor(() => confirmButton = getByRole(dialog, "button", {name: "Transfer"}));
    await waitFor(() => expect(confirmButton).not.toBeDisabled());
    await userEvent.click(confirmButton!);

    expect(mutateRecoveredBalanceState).toBeCalledTimes(1);
});
