jest.mock('../../logion-chain');
jest.mock('../../logion-chain/Balances');
jest.mock('../../logion-chain/Signature');
jest.mock('../../common/CommonContext');
jest.mock('../UserContext');

import { CoinBalance } from "../../logion-chain/Balances";
import { render, screen, waitFor, getByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { setGetBalances } from '../../logion-chain/__mocks__/BalancesMock';
import { setRecoveredAddress } from '../__mocks__/UserContextMock';

import RecoveryProcess from './RecoveryProcess';
import { PrefixedNumber, MILLI } from "../../logion-chain/numbers";

test("Recovered tokens can be transferred", async () => {
    const recoveredAccountId = "recoveredAccountId";
    setRecoveredAddress(recoveredAccountId);

    const coinBalance:CoinBalance = {
        coin: {
            id: 'dot',
            name: 'Polkadot',
            iconId: 'dot',
            iconType: 'png',
            symbol: 'DOT',
        },
        balance: new PrefixedNumber("100", MILLI),
        level: 1
    }

    const getBalances = jest.fn().mockResolvedValue([
        coinBalance
    ]);
    setGetBalances(getBalances);

    render(<RecoveryProcess />);

    expect(getBalances).toBeCalledTimes(1);
    expect(getBalances).toBeCalledWith(expect.objectContaining({
        api: expect.anything(),
        accountId: recoveredAccountId
    }));

    let transferButton: HTMLElement;
    await waitFor(() => transferButton = screen.getByRole("button", {name: "Transfer"}));
    userEvent.click(transferButton!);

    let dialog: HTMLElement;
    await waitFor(() => dialog = screen.getByRole("dialog"));
    let confirmButton: HTMLElement;
    await waitFor(() => confirmButton = getByRole(dialog, "button", {name: "Transfer"}));
    userEvent.click(confirmButton!);

    await waitFor(() => expect(getBalances).toBeCalledTimes(2));
});
