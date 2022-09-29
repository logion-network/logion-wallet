import { LegalOfficerCase } from '@logion/node-api/dist/Types';

import { DEFAULT_LEGAL_OFFICER } from '../../../../common/TestData';
import { TEST_WALLET_USER } from '../../../../wallet-user/TestData';

export function createLogionIdentityLoc(parameters: any) {
    return Promise.resolve();
}

export function createLogionTransactionLoc(parameters: any) {
    return Promise.resolve();
}

export function createPolkadotIdentityLoc(parameters: any) {
    return Promise.resolve();
}

export function createPolkadotTransactionLoc(parameters: any) {
    return Promise.resolve();
}

export function createCollectionLoc(parameters: any) {
    return Promise.resolve();
}

export const CLOSED_IDENTITY_LOC_ID = "85833363768713528858922097642089825569";

export const UNPREFIXED_FILE_HASH = "42";

export const CLOSED_IDENTITY_LOC: LegalOfficerCase = {
    owner: DEFAULT_LEGAL_OFFICER,
    requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
    locType: 'Identity',
    closed: true,
    files: [
        {
            hash: "0x" + UNPREFIXED_FILE_HASH,
            nature: "some-nature",
            submitter: TEST_WALLET_USER
        }
    ],
    metadata: [],
    links: [],
    collectionCanUpload: false,
}

export function getLegalOfficerCase(parameters: any) {
    if(parameters.locId.toDecimalString() === CLOSED_IDENTITY_LOC_ID) {
        return Promise.resolve(CLOSED_IDENTITY_LOC);
    } else if(parameters.locId.toDecimalString() === OPEN_IDENTITY_LOC_ID) {
        return Promise.resolve(OPEN_IDENTITY_LOC);
    } else {
        return Promise.resolve(undefined);
    }
}

export const OPEN_IDENTITY_LOC_ID = "195914524858768213081425411950368569411";

export const OPEN_IDENTITY_LOC: LegalOfficerCase = {
    owner: DEFAULT_LEGAL_OFFICER,
    requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
    locType: 'Identity',
    closed: false,
    files: [],
    metadata: [],
    links: [],
    collectionCanUpload: false,
}

export function addMetadata(parameters: any) {
    return Promise.resolve();
}

export function addFile(parameters: any) {
    return Promise.resolve();
}

export function addLink(parameters: any) {
    return Promise.resolve();
}

export function closeLoc(parameters: any) {
    return Promise.resolve();
}

export function voidLoc(parameters: any) {
    return Promise.resolve();
}

export const CLOSED_COLLECTION_LOC_ID = "195914524858768213081425411950368569411";

export const CLOSED_COLLECTION_LOC: LegalOfficerCase = {
    owner: DEFAULT_LEGAL_OFFICER,
    requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
    locType: 'Collection',
    closed: true,
    files: [],
    metadata: [],
    links: [],
    collectionCanUpload: false,
}

export function getCollectionItem() {
    return undefined;
}

export function addCollectionItem(parameters: any) {
    return Promise.resolve();
}
