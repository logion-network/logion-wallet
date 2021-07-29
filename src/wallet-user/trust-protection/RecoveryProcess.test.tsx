jest.mock('../../logion-chain');
jest.mock('../../logion-chain/Assets');
jest.mock('../../logion-chain/Signature');
jest.mock('../../common/RootContext');
jest.mock('../UserContext');

import { render, screen, waitFor, getByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { setAccountBalance } from '../../logion-chain/__mocks__/AssetsMock';
import { DEFAULT_LEGAL_OFFICER } from "../../common/types/LegalOfficer";
import { setRecoveredAddress } from '../../wallet-user/__mocks__/UserContextMock';

import RecoveryProcess from './RecoveryProcess';

test("Recovered tokens can be transferred", async () => {
    const recoveredAccountId = "recoveredAccountId";
    setRecoveredAddress(recoveredAccountId);
    const accountBalance = jest.fn().mockResolvedValue([
        {
            asset: {
                metadata: {
                    symbol: "TK1",
                    name: "TOKEN1"
                },
                issuer: DEFAULT_LEGAL_OFFICER,
            },
            balance: "42"
        }
    ]);
    setAccountBalance(accountBalance);

    render(<RecoveryProcess />);

    expect(accountBalance).toBeCalledTimes(1);
    expect(accountBalance).toBeCalledWith(expect.objectContaining({
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

    await waitFor(() => expect(accountBalance).toBeCalledTimes(2));
});
