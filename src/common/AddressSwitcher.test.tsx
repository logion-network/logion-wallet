import moment from 'moment';
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Accounts, { Account } from './types/Accounts';
import { shallowRender } from '../tests';
import AddressSwitcher from './AddressSwitcher';
import { setAddresses, authenticate } from './__mocks__/CommonContextMock';
import { TEST_WALLET_USER } from '../wallet-user/TestData';
import { DEFAULT_LEGAL_OFFICER } from "./TestData";

jest.mock('./CommonContext');
jest.mock('./Authentication');

const AUTHENTICATED_ADDRESS: Account = {
    name: "name authenticated",
    address: TEST_WALLET_USER,
    isLegalOfficer: false,
    token: {
        value: "token",
        expirationDateTime: moment('2021-09-10T10:53:00.000Z'),
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

describe("AddressSwitcher", () => {

    it("renders", () => {
        setAddresses(ADDRESSES);
        const result = shallowRender(
            <AddressSwitcher
                selectAddress={ () => {} }
            />
        );
        expect(result).toMatchSnapshot();
    });

    it("enables log-in given unautenticated yet user", async () => {
        setAddresses(ADDRESSES);
        render(
            <AddressSwitcher
                selectAddress={ () => {} }
            />
        );

        userEvent.click(screen.getByText("Click to select another address"));
        await waitFor(() => userEvent.click(screen.getByRole('button', {name:"login button"})));

        await waitFor(() => expect(authenticate).toBeCalledWith([ DEFAULT_LEGAL_OFFICER ]));
    });
});
