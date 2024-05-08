import { Lgnt, Numbers } from "@logion/node-api";
import { shallowRender } from '../tests';

import AccountAddress from './AccountAddress';
import { TEST_WALLET_USER } from "src/wallet-user/TestData";

describe("AccountAddress", () => {

    it("renders", () => {
        const result = shallowRender(
            <AccountAddress
                balance={{
                    available: Lgnt.from(2),
                    total: Lgnt.from(2),
                    reserved: Lgnt.zero(),
                }}
                account={{
                    name: "Name 1",
                    accountId: TEST_WALLET_USER,
                    isLegalOfficer: false,
                }}
                disabled={ false }
            />
        );
        expect(result).toMatchSnapshot();
    });
    
});
