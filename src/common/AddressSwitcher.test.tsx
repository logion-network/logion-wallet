import moment from 'moment';
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Addresses, { AccountAddress } from './types/Addresses';
import { shallowRender } from '../tests';
import AddressSwitcher from './AddressSwitcher';
import { setAddresses } from './__mocks__/CommonContextMock';
import { TEST_WALLET_USER } from '../wallet-user/TestData';
import { DEFAULT_LEGAL_OFFICER } from './types/LegalOfficer';
import { authenticate } from './Authentication';

jest.mock('./CommonContext');
jest.mock('./Authentication');

const AUTHENTICATED_ADDRESS: AccountAddress = {
    name: "name authenticated",
    address: TEST_WALLET_USER,
    isLegalOfficer: false,
    token: {
        value: "token",
        expirationDateTime: moment('2021-09-10T10:53:00.000Z'),
    },
};

const UNAUTHENTICATED_ADDRESS: AccountAddress = {
    name: "name unauthenticated",
    address: DEFAULT_LEGAL_OFFICER,
    isLegalOfficer: true,
};

const ADDRESSES: Addresses = {
    currentAddress: AUTHENTICATED_ADDRESS,
    addresses: [ UNAUTHENTICATED_ADDRESS ]
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

        await waitFor(() => expect(authenticate).toBeCalledWith(expect.anything(), [ DEFAULT_LEGAL_OFFICER ]));
    });
});
