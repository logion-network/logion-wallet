import { DateTime } from "luxon";
import { ALAIN, GUILLAUME, PATRICK, threeLegalOfficers } from "../common/TestData";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
export { toIsoString, fromIsoString } from "@logion/client/dist/DateTimeUtil.js";
import { api } from "./LogionMock";
import { VerifiedIssuerWithSelect } from "@logion/client/dist/Loc";
import { Hash } from "@logion/node-api";

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
        return address === PATRICK.address || address === GUILLAUME.address || address === ALAIN.address;
    }

    isRegisteredLegalOfficer(address: string) {
        return address === PATRICK.address || address === GUILLAUME.address || address === ALAIN.address;
    }

    legalOfficers = threeLegalOfficers;

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

    public = {
        fees: {
            estimateWithoutStorage: () => Promise.resolve({ inclusionFee: 42n, totalFee: 42n }),
            estimateAddFile: () => Promise.resolve({ inclusionFee: 42n, storageFee: 32n, totalFee: 74n }),
        },
        findCollectionLocItemById: () => { isAuthenticatedTokenOwner: () => true },
    };
    currentAddress = TEST_WALLET_USER;

    logionApi = api.object();

    getLegalOfficer(address: string) {
        if(address === PATRICK.address) {
            return threeLegalOfficers[0];
        } else if(address === GUILLAUME.address) {
            return threeLegalOfficers[1];
        } else if(address === ALAIN.address) {
            return threeLegalOfficers[2];
        } else {
            throw new Error();
        }
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

    get(account: any) {
        return ({
            value: `some-token-value-for-${account.address}`,
            expirationDateTime: DateTime.now().plus({hours: 1})
        });
    }
}

export class LocRequestState {
    data: any;
    locsState: any;
    async refresh(): Promise<LocRequestState> {
        return this;
    }
    getCurrentState() {
        return this;
    }
    isRequester(account: any) {
        return false;
    }
    isOwner(account: any) {
        return false;
    }
}

export class ClosedCollectionLoc extends LocRequestState {
    requestSof: jest.Mock<Promise<EditableRequest>> | undefined;
}

export class ClosedLoc extends LocRequestState {

    legalOfficer: {
        requestVote: any,
    } = {
        requestVote: jest.fn(),
    };
}

export class EditableRequest extends LocRequestState {
    addMetadata: jest.Mock<Promise<EditableRequest>> | undefined;
    deleteMetadata: jest.Mock<Promise<EditableRequest>> | undefined;
    addFile: jest.Mock<Promise<EditableRequest>> | undefined;
    deleteFile: jest.Mock<Promise<EditableRequest>> | undefined;
    addLink: jest.Mock<Promise<EditableRequest>> | undefined;
    deleteLink: jest.Mock<Promise<EditableRequest>> | undefined;
}

export class DraftRequest extends EditableRequest {

}

export class PendingRequest extends LocRequestState {

    legalOfficer: {
        accept: any,
        acceptCollection: any,
    } = {
        accept: jest.fn(),
        acceptCollection: jest.fn(),
    };
}

export class OpenLoc extends EditableRequest {
    data: any;
    locsState: any;
    addMetadata: jest.Mock<Promise<EditableRequest>> | undefined;
    deleteMetadata: jest.Mock<Promise<EditableRequest>> | undefined;
    addFile: jest.Mock<Promise<EditableRequest>> | undefined;
    deleteFile: jest.Mock<Promise<EditableRequest>> | undefined;
    addLink: jest.Mock<Promise<EditableRequest>> | undefined;
    deleteLink: jest.Mock<Promise<EditableRequest>> | undefined;
    requestSof: jest.Mock<Promise<EditableRequest>> | undefined;
    legalOfficer: {
        close: any,
        voidLoc: any,
        getVerifiedIssuers: () => Promise<VerifiedIssuerWithSelect[]>,
        setCollectionFileRestrictedDelivery: (params: any) => Promise<OpenLoc>,
        canClose: (autoAck: boolean) => boolean,
        canAutoAck: () => boolean,
    } = {
        close: jest.fn(),
        voidLoc: jest.fn(),
        getVerifiedIssuers: () => Promise.resolve(issuers),
        setCollectionFileRestrictedDelivery: () => Promise.resolve(this),
        canClose: () => true,
        canAutoAck: () => true,
    };
}

export function setVerifiedIssuers(array: VerifiedIssuerWithSelect[]) {
    issuers = array;
}

let issuers: VerifiedIssuerWithSelect[] = [];

export class LocsState {
}

let expectedFileHash = Hash.of("");

export function setExpectedFileHash(hash: Hash) {
    expectedFileHash = hash;
}

export class HashOrContent {

    static async fromContentFinalized(file: File) {
        return new HashOrContent(file);
    }

    static fromContent(file: File) {
        return new HashOrContent(file);
    }

    constructor(file: File) {
        this.file = file;
    }

    private file: File;

    get contentHash(): Hash {
        return expectedFileHash;
    }

    get content(): File {
        return this.file;
    }

    finalize() {

    }
}

export class ReadOnlyLocState extends LocRequestState {

}
