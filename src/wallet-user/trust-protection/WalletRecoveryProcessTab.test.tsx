import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, getByRole } from '@testing-library/react';
import { PrefixedNumber, MILLI } from "logion-api/dist/numbers";
import { CoinBalance } from "logion-api/dist/Balances";

import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from "../../common/TestData";
import { setGetBalances } from '../../__mocks__/logion-api/dist/BalancesMock';
import { setRecoveredAddress, setRecoveryConfig } from '../__mocks__/UserContextMock';

import WalletRecoveryProcessTab from "./WalletRecoveryProcessTab";
import { finalizeSubmission } from "../../logion-chain/__mocks__/SignatureMock";

jest.mock('../../logion-chain');
jest.mock('logion-api/dist/Balances');
jest.mock('../../logion-chain/Signature');
jest.mock("logion-api/dist/Recovery");
jest.mock('../../common/CommonContext');
jest.mock('../UserContext');

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
        available: new PrefixedNumber("100", MILLI),
        level: 1
    }

    const getBalances = jest.fn().mockResolvedValue([
        coinBalance
    ]);
    setGetBalances(getBalances);

    render(<WalletRecoveryProcessTab vaultFirst={ false } onSuccess={ () => {} } />);

    expect(getBalances).toBeCalledTimes(1);
    expect(getBalances).toBeCalledWith(expect.objectContaining({
        api: expect.anything(),
        accountId: recoveredAccountId
    }));

    let transferButton: HTMLElement;
    await waitFor(() => transferButton = screen.getByRole("button", {name: "Transfer"}));
    await userEvent.click(transferButton!);

    let dialog: HTMLElement;
    await waitFor(() => dialog = screen.getByRole("dialog"));
    let confirmButton: HTMLElement;
    await waitFor(() => confirmButton = getByRole(dialog, "button", {name: "Transfer"}));
    await userEvent.click(confirmButton!);
    await waitFor(() => finalizeSubmission());

    await waitFor(() => expect(getBalances).toBeCalledTimes(2));
});
