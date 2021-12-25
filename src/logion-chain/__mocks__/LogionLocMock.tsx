import { signAndSend } from './SignatureMock';

export function createLogionIdentityLoc(parameters: any) {
    signAndSend(parameters);
    return Promise.resolve();
}

export function createLogionTransactionLoc(parameters: any) {
    signAndSend(parameters);
    return Promise.resolve();
}

export function createPolkadotIdentityLoc(parameters: any) {
    signAndSend(parameters);
    return Promise.resolve();
}

export function createPolkadotTransactionLoc(parameters: any) {
    signAndSend(parameters);
    return Promise.resolve();
}

export const CLOSED_IDENTITY_LOC_ID = "85833363768713528858922097642089825569";

export const CLOSED_IDENTITY_LOC = {
    requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
    locType: 'Identity',
    closed: true
}

export function getLegalOfficerCase(parameters: any) {
    if(parameters.locId.toDecimalString() === CLOSED_IDENTITY_LOC_ID) {
        return Promise.resolve(CLOSED_IDENTITY_LOC);
    } else {
        return Promise.resolve(undefined);
    }
}
