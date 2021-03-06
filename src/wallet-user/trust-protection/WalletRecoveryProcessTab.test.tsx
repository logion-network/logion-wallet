import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, getByRole } from '@testing-library/react';
import { PrefixedNumber, MILLI } from "@logion/node-api/dist/numbers";
import { CoinBalance } from "@logion/node-api/dist/Balances";

import { mutateRecoveredBalanceState, setProtectionState, setRecoveredBalanceState } from '../__mocks__/UserContextMock';

import WalletRecoveryProcessTab from "./WalletRecoveryProcessTab";
import { ClaimedRecovery } from '@logion/client';
import { ProtectionParameters } from '@logion/client/dist/Recovery';
import { BalanceState } from '@logion/client/dist/Balance';

jest.mock('../../logion-chain');
jest.mock('../../common/CommonContext');
jest.mock('../UserContext');

test("Recovered tokens can be transferred", async () => {
    const recoveredAccountId = "5GEZAeYtVZPEEmCT66scGoWS4Jd7AWJdXeNyvxC3LxKP8jCn";
    const protectionState = {
        protectionParameters: {
            recoveredAddress: recoveredAccountId,
        } as ProtectionParameters
    } as unknown as ClaimedRecovery;
    setProtectionState(protectionState);

    const coinBalance: CoinBalance = {
        coin: {
            id: 'dot',
            name: 'Polkadot',
            iconId: 'dot',
            iconType: 'png',
            symbol: 'DOT',
        },
        balance: new PrefixedNumber("100", MILLI),
        available: new PrefixedNumber("100", MILLI),
        level: 1
    }

    setRecoveredBalanceState({
        balances: [ coinBalance ]
    } as BalanceState);

    render(<WalletRecoveryProcessTab vaultFirst={ false } />);

    let transferButton: HTMLElement;
    await waitFor(() => transferButton = screen.getByRole("button", {name: "Transfer"}));
    await userEvent.click(transferButton!);

    let dialog: HTMLElement;
    await waitFor(() => dialog = screen.getByRole("dialog"));
    let confirmButton: HTMLElement;
    await waitFor(() => confirmButton = getByRole(dialog, "button", {name: "Transfer"}));
    await waitFor(() => expect(confirmButton).not.toBeDisabled());
    await userEvent.click(confirmButton!);

    expect(mutateRecoveredBalanceState).toBeCalledTimes(1);
});
