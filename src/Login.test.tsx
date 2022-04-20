import moment from 'moment';
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Accounts, { Account } from './common/types/Accounts';
import { shallowRender } from './tests';
import { setAddresses, authenticate } from './common/__mocks__/CommonContextMock';
import { TEST_WALLET_USER } from './wallet-user/TestData';
import { DEFAULT_LEGAL_OFFICER } from "./common/TestData";
import Login from './Login';

jest.mock('./logion-chain');
jest.mock('./common/CommonContext');
jest.mock('./common/Authentication');

const AUTHENTICATED_ADDRESS: Account = {
    name: "name authenticated",
    address: TEST_WALLET_USER,
    isLegalOfficer: false,
    token: {
        value: "token",
        expirationDateTime: moment('2021-09-10T10:53:00.000'),
    },
};

const UNAUTHENTICATED_ADDRESS: Account = {
    name: "name unauthenticated",
    address: DEFAULT_LEGAL_OFFICER,
    isLegalOfficer: true,
};

const ADDRESSES: Accounts = {
    current: AUTHENTICATED_ADDRESS,
    all: [ UNAUTHENTICATED_ADDRESS ]
};

describe("Login", () => {

    it("renders", () => {
        setAddresses(ADDRESSES);
        const result = shallowRender(
            <Login />
        );
        expect(result).toMatchSnapshot();
    });

    it("enables log-in given unautenticated yet user", async () => {
        setAddresses(ADDRESSES);
        render(
            <Login />
        );

        await userEvent.click(screen.getByRole('checkbox'));
        await userEvent.click(screen.getByRole('button', {name: "Log in"}));

        await waitFor(() => expect(authenticate).toBeCalledWith([ DEFAULT_LEGAL_OFFICER ]));
    });
});
