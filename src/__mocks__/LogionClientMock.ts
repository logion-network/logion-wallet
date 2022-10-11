import { DateTime } from "luxon";
import { PATRICK } from "../common/TestData";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
export { toIsoString, fromIsoString } from "@logion/client/dist/DateTimeUtil";

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

    tokens = new AccountTokens();

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

    locsState() {
        return {

            findById: () => undefined
        };
    }

    authenticate() {
        return this;
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

let _isSuccessful: boolean | undefined = undefined;

export function isSuccessful(result: any) {
    if(_isSuccessful === undefined) {
        return result !== null && result.isInBlock;
    } else {
        return _isSuccessful;
    }
}

export function setIsSuccessful(value: boolean) {
    _isSuccessful = value;
}

export class ClosedCollectionLoc {

}
