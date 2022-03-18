import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from "../../common/TestData";

jest.mock('../../logion-chain');
jest.mock('../../logion-chain/Balances');
jest.mock('../../logion-chain/Signature');
jest.mock('../../common/CommonContext');
jest.mock('../UserContext');

import { CoinBalance } from "../../logion-chain/Balances";
import { render, screen, waitFor, getByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { setGetBalances } from '../../logion-chain/__mocks__/BalancesMock';
import { setRecoveredAddress, setRecoveryConfig } from '../__mocks__/UserContextMock';

import RecoveryProcess from './RecoveryProcess';
import { PrefixedNumber, MILLI } from "../../logion-chain/numbers";
import { finalizeSubmission } from "../../logion-chain/__mocks__/SignatureMock";

test("Recovered tokens can be transferred", async () => {
    const recoveredAccountId = "5GEZAeYtVZPEEmCT66scGoWS4Jd7AWJdXeNyvxC3LxKP8jCn";
    setRecoveredAddress(recoveredAccountId);
    setRecoveryConfig({ legalOfficers: [ DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER ] })

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

    expect(getBalances).toBeCalledTimes(2);
    expect(getBalances).toBeCalledWith(expect.objectContaining({
        api: expect.anything(),
        accountId: recoveredAccountId
    }));

    let transferButton: HTMLElement[];
    await waitFor(() => transferButton = screen.getAllByRole("button", {name: "Transfer"}));
    userEvent.click(transferButton![0]);

    let dialog: HTMLElement;
    await waitFor(() => dialog = screen.getByRole("dialog"));
    let confirmButton: HTMLElement;
    await waitFor(() => confirmButton = getByRole(dialog, "button", {name: "Transfer"}));
    userEvent.click(confirmButton!);
    await waitFor(() => finalizeSubmission());

    await waitFor(() => expect(getBalances).toBeCalledTimes(5));
});
