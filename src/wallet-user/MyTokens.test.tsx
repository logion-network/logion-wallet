jest.mock('../logion-chain');
jest.mock('../logion-chain/Assets');
jest.mock('../RootContext');
jest.mock('./UserContext');
jest.mock('react-router-dom');

import { shallowRender } from '../tests';
import MyTokens from './MyTokens';
import { render, screen, waitFor } from '@testing-library/react';
import { setAccountBalance } from '../logion-chain/__mocks__/AssetsMock';
import { DEFAULT_LEGAL_OFFICER } from "../common/types/LegalOfficer";
import { TEST_WALLET_USER } from '../wallet-user/TestData';

test("renders with no requests", () => {
    const tree = shallowRender(<MyTokens />);
    expect(tree).toMatchSnapshot();
});

test("renders with requests", async () => {
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

    render(<MyTokens />);

    await waitFor(() => expect(screen.getByText("TK1")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("TOKEN1")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("42")).toBeInTheDocument());
    expect(accountBalance).toBeCalledTimes(1);
    expect(accountBalance).toBeCalledWith(expect.objectContaining({
        api: expect.anything(),
        accountId: TEST_WALLET_USER
    }));
});
