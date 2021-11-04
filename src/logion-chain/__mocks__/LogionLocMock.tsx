import { signAndSend } from './SignatureMock';

export function createLoc(parameters: any) {
    signAndSend(parameters);
    return Promise.resolve();
}

export const CLOSED_IDENTITY_LOC_ID = "85833363768713528858922097642089825569";

export const CLOSED_IDENTITY_LOC = {
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
