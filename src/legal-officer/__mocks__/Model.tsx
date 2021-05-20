export const DEFAULT_LEGAL_OFFICER = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; // Alice
export const ANOTHER_LEGAL_OFFICER = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"; // Bob

import { TokenizationRequest as RealTokenizationRequest } from '../Model';
export type TokenizationRequest = RealTokenizationRequest;

export const INITIAL_REQUESTS_MOCK: TokenizationRequest[] = [
    {
        id: "1",
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        requestedTokenName: "TOKEN1",
        bars: 1,
        status: "PENDING"
    },
    {
        id: "2",
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        requestedTokenName: "TOKEN2",
        bars: 2,
        status: "PENDING"
    },
    {
        id: "3",
        legalOfficerAddress: ANOTHER_LEGAL_OFFICER,
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        requestedTokenName: "TOKEN3",
        bars: 3,
        status: "PENDING"
    },
];

let requestsMock = buildDeepCopy(INITIAL_REQUESTS_MOCK);

function buildDeepCopy(requests: TokenizationRequest[]): TokenizationRequest[] {
    return requests.map(request => { return {...request} });
}

import { FetchRequestSpecification as RealFetchRequestSpecification } from '../Model';
export type FetchRequestSpecification = RealFetchRequestSpecification;

export async function fetchRequests(specification: FetchRequestSpecification): Promise<TokenizationRequest[]> {
    return Promise.resolve(buildDeepCopy(requestsMock
        .filter(request => request.legalOfficerAddress === specification.legalOfficerAddress)
        .filter(request => request.status === specification.status)));
}

export async function rejectRequest(parameters: any): Promise<void> {
    for(let requestIndex = 0; requestIndex < requestsMock.length; ++requestIndex) {
        const request = requestsMock[requestIndex];
        if(request.id === parameters.requestId && request.status === "PENDING") {
            request.status = "REJECTED";
            return Promise.resolve();
        }
    }
    return Promise.resolve();
}
