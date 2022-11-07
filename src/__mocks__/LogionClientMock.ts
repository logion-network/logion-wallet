import { DateTime } from "luxon";
import { PATRICK } from "../common/TestData";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
export { toIsoString, fromIsoString } from "@logion/client/dist/DateTimeUtil";

export const axiosMock = {
    post: jest.fn().mockReturnValue(undefined),
};

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

    isLegalOfficer(address: string) {
        return address === PATRICK.address;
    }

    isRegisteredLegalOfficer(address: string) {
        return address === PATRICK.address;
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

    buildAxios() {
        return axiosMock;
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

export class LocRequestState {
    data: any;
    locsState: any;
    refresh: (() => Promise<LocRequestState>) | undefined;
}

export class ClosedCollectionLoc extends LocRequestState {
    requestSof: jest.Mock<Promise<EditableRequest>> | undefined;
}

export class ClosedLoc extends LocRequestState {

}

export class EditableRequest extends LocRequestState {
    addMetadata: jest.Mock<Promise<EditableRequest>> | undefined;
    deleteMetadata: jest.Mock<Promise<EditableRequest>> | undefined;
    addFile: jest.Mock<Promise<EditableRequest>> | undefined;
    deleteFile: jest.Mock<Promise<EditableRequest>> | undefined;
}

export class DraftRequest extends EditableRequest {

}

export class OpenLoc extends EditableRequest {
    data: any;
    locsState: any;
    refresh: (() => Promise<EditableRequest>) | undefined;
    addMetadata: jest.Mock<Promise<EditableRequest>> | undefined;
    deleteMetadata: jest.Mock<Promise<EditableRequest>> | undefined;
    addFile: jest.Mock<Promise<EditableRequest>> | undefined;
    deleteFile: jest.Mock<Promise<EditableRequest>> | undefined;
    requestSof: jest.Mock<Promise<EditableRequest>> | undefined;
}

export class LocsState {
}
