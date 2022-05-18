import { DateTime } from "luxon";
import { PATRICK } from "../common/TestData";
import { TEST_WALLET_USER } from "../wallet-user/TestData";

export class LogionClient {

    static create() {
        return new LogionClient()
    }

    useTokens(tokens: any) {
        this.tokens = tokens;
        return this;
    }

    withCurrentAddress() {
        return this;
    }

    tokens = null;

    isLegalOfficer() {
        return false;
    }

    legalOfficers = [ PATRICK ];

    isValidAddress() {
        return true;
    }

    isProtected() {
        return true;
    }
}

export class AccountTokens {

    loadTokens() {
        return this;
    }

    cleanUp() {
        return this;
    }

    addresses = [ TEST_WALLET_USER ];

    get() {
        return ({
            value: "some-token",
            expirationDateTime: DateTime.now().plus({hours: 1})
        });
    }
}
