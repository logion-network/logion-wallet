import { DateTime } from "luxon";
import { LegalOfficer } from '@logion/client';
import { ValidAccountId } from "@logion/node-api";
import { DEFAULT_LEGAL_OFFICER, legalOfficers } from 'src/common/TestData';
import { TEST_WALLET_USER } from 'src/wallet-user/TestData';
import { AxiosInstance } from 'axios';
import { Mock } from 'moq.ts';
import Accounts, { Account } from 'src/common/types/Accounts';
import { LogionClient } from '@logion/client/dist/LogionClient.js';
import { LogionClient as LogionClientMock } from '../../__mocks__/LogionClientMock';
import { api } from "src/__mocks__/LogionMock";
import { Call, CallBatch } from "../LogionChainContext";

export const LogionChainContextProvider = (props: any) => null;

export let clientMock: LogionClient | LogionClientMock | null = new LogionClientMock();

export let authenticate = jest.fn();

export let saveOfficer = jest.fn();

function getOfficer(account: ValidAccountId | undefined): LegalOfficer | undefined {
    return legalOfficers.find(legalOfficer => legalOfficer.account.equals(account));
}

export let selectAddress = jest.fn();

export const DEFAULT_USER_ACCOUNT: Account = {
    name: "name",
    accountId: TEST_WALLET_USER,
    isLegalOfficer: false,
    token: {
        value: "token",
        expirationDateTime: DateTime.now(),
    },
}

export const DEFAULT_LEGAL_OFFICER_ACCOUNT: Account = {
    name: "name",
    accountId: DEFAULT_LEGAL_OFFICER,
    isLegalOfficer: true,
    token: {
        value: "token",
        expirationDateTime: DateTime.now(),
    },
}

export let accounts: Accounts | null = {
    current: DEFAULT_USER_ACCOUNT,
    all: [ DEFAULT_USER_ACCOUNT ]
}

export function setCurrentAddress(value: Account | undefined) {
    if(value === undefined) {
        accounts = {
            current: undefined,
            all: [ DEFAULT_USER_ACCOUNT ]
        };
    } else {
        accounts = {
            current: value,
            all: [ value ]
        };
    }
    if(context) {
        context.accounts = accounts;
    }
}

export function setAddresses(value: Accounts | null) {
    accounts = value;
}

export let axiosMock = new Mock<AxiosInstance>();

export function resetAxiosMock() {
    axiosMock = new Mock<AxiosInstance>();
}

let context: any = undefined;

export function setContextMock(value: any) {
    context = value;
}

let axiosFactory = () => axiosMock.object();

let signAndSend = jest.fn().mockResolvedValue(undefined);

let signer = {
    signAndSend,
};

export const NO_SUBMISSION: unknown = {
    canSubmit: () => true,
    isSuccessful: () => false,
    isError: () => false,
    error: null,
    result: null,
};

let extrinsicSubmissionState: unknown = NO_SUBMISSION;

export const SUCCESSFUL_SUBMISSION: unknown = {
    canSubmit: () => true,
    isSuccessful: () => true,
    isError: () => false,
    isInProgress: () => false,
    error: null,
    getError: () => null,
    getResult: () => ({
        status: {
            isInBlock: true,
        },
        isInBlock: true,
    }),
    result: {
        status: {
            isInBlock: true,
        },
        isInBlock: true,
    },
    callEnded: true,
    submitted: true,
};

export const FAILED_SUBMISSION: unknown = {
    canSubmit: () => true,
    isSuccessful: () => false,
    isError: () => true,
    isInProgress: () => false,
    error: "error",
    getError: () => "error",
    getResult: () => ({
        status: {
            isInBlock: false,
        }
    }),
    result: {
        status: {
            isInBlock: false,
        }
    },
    callEnded: true,
    submitted: true,
};

export const PENDING_SUBMISSION: unknown = {
    canSubmit: () => false,
    isSuccessful: () => false,
    isError: () => false,
    isInProgress: () => true,
    error: null,
    getError: () => null,
    getResult: () => ({
        status: {
            isInBlock: false,
        }
    }),
    result: {
        status: {
            isInBlock: false,
        }
    },
};

export function setExtrinsicSubmissionState(state: unknown) {
    extrinsicSubmissionState = state;
}

export function useLogionChain() {
    if(context) {
        return context;
    } else {
        return {
            injectedAccounts: null,
            api: api.object(),
            connectedNodeMetadata: {

            },
            selectAddress,
            accounts,
            axiosFactory,
            authenticate,
            getOfficer,
            saveOfficer,
            client: clientMock,
            isCurrentAuthenticated: () => true,
            authenticateAddress,
            signer,
            backendConfig: {
                [DEFAULT_LEGAL_OFFICER.address]: {
                    iDenfy: false,
                }
            },
            extrinsicSubmissionState,
            resetSubmissionState: () => {},
            submitSignAndSubmit: () => {},
            submitCall: (call: Call) => call(() => {}),
            submitCallBatch: (batch: CallBatch) => { batch.jobs.forEach(job => job.call(() => {})); return {}; },
            clearSubmissionState: () => {},
        };
    }
}

function authenticateAddress() {
    return clientMock;
}

export function setClientMock(mock: LogionClient | null) {
    clientMock = mock;
}
