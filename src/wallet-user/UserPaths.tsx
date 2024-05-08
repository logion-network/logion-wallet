import { UUID, LocType, Hash } from '@logion/node-api';
import { getBaseUrl } from "../PublicPaths";

import {
    USER_PATH,
    locRequestsRelativePath,
    locDetailsRelativePath,
    LOC_DETAILS_RELATIVE_PATH
} from '../RootPaths';

export const HOME_PATH = USER_PATH;
export const TRUST_PROTECTION_RELATIVE_PATH = '/protection';
export const TRUST_PROTECTION_PATH = USER_PATH + TRUST_PROTECTION_RELATIVE_PATH;
export const SETTINGS_RELATIVE_PATH = '/settings';
export const SETTINGS_PATH = USER_PATH + SETTINGS_RELATIVE_PATH;
export const RECOVERY_RELATIVE_PATH = '/recovery';
export const RECOVERY_PATH = USER_PATH + RECOVERY_RELATIVE_PATH;
export const WALLET_RELATIVE_PATH = '/wallet';
export const VAULT_RELATIVE_PATH = '/vault';
export const ISSUER_RELATIVE_PATH = '/verified-issuer';
export const ISSUER_PATH = USER_PATH + ISSUER_RELATIVE_PATH;
export const ISSUER_DETAILS_RELATIVE_PATH = ISSUER_RELATIVE_PATH + '/:locId';
export const IDENFY_RELATIVE_PATH = '/idenfy';
export const IDENFY_PATH = USER_PATH + IDENFY_RELATIVE_PATH;
export const REQUEST_LOC_RELATIVE_PATH = '/loc/:locType-request';

export function issuerDetailsPath(locId: UUID | string) {
    return USER_PATH + ISSUER_DETAILS_RELATIVE_PATH
        .replace(":locId", locId.toString())
}

export const TRANSACTIONS_RELATIVE_PATH = WALLET_RELATIVE_PATH;
export const TRANSACTIONS_PATH = USER_PATH + TRANSACTIONS_RELATIVE_PATH;

export const VAULT_TRANSACTIONS_RELATIVE_PATH = VAULT_RELATIVE_PATH;
export const VAULT_TRANSACTIONS_PATH = USER_PATH + VAULT_TRANSACTIONS_RELATIVE_PATH;

export function dataLocDetailsPath(locType: LocType, locId: string) {
    return USER_PATH + locDetailsRelativePath(locType)
        .replace(":locId", locId)
}

export function locRequestsPath(locType: LocType) {
    return USER_PATH + locRequestsRelativePath(locType)
}

export function requestLocRelativePath(locType: LocType) {
    return REQUEST_LOC_RELATIVE_PATH
        .replace(":locType", locType.toLowerCase())
}

export function requestLocPath(locType: LocType) {
    return USER_PATH + requestLocRelativePath(locType)
}

export function locDetailsPath(locId: string | UUID, locType: LocType) {
    let stringId;
    if(locId instanceof UUID) {
        stringId = locId.toString();
    } else {
        stringId = locId;
    }
    return dataLocDetailsPath(locType, stringId);
}

export const PARAM_RESULT = "result";
export const PARAM_LOC_ID = "locId";

export function resumeAfterIDenfyProcessUrl(result: 'success' | 'error' | 'unverified', locId: UUID): string {
    return `${ getBaseUrl() }${ IDENFY_PATH }?${ PARAM_RESULT }=${ result }&${ PARAM_LOC_ID }=${ locId.toString() }`;
}

export const DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH = LOC_DETAILS_RELATIVE_PATH + "/claims/:hash";
export function documentClaimHistoryPath(locId: UUID, hash: Hash) {
    return USER_PATH + DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString())
        .replace(":hash", hash.toHex());
}

export const TOKENS_RECORD_RELATIVE_PATH = LOC_DETAILS_RELATIVE_PATH + "/records";
export function tokensRecordPath(locId: UUID) {
    return USER_PATH + TOKENS_RECORD_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString());
}

export const ISSUER_TOKENS_RECORD_RELATIVE_PATH = ISSUER_DETAILS_RELATIVE_PATH + "/records";
export function issuerTokensRecordPath(locId: UUID) {
    return USER_PATH + ISSUER_TOKENS_RECORD_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString());
}

export const TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH = LOC_DETAILS_RELATIVE_PATH + "/records/:recordId/claims/:hash";
export function tokensRecordDocumentClaimHistoryPath(locId: UUID, recordId: Hash, hash: Hash) {
    return USER_PATH + TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString())
        .replace(":recordId", recordId.toHex())
        .replace(":hash", hash.toHex());
}

export const ISSUER_TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH = ISSUER_DETAILS_RELATIVE_PATH + "/records/:recordId/claims/:hash";
export function issuerTokensRecordDocumentClaimHistoryPath(locId: UUID, recordId: Hash, hash: Hash) {
    return USER_PATH + ISSUER_TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString())
        .replace(":recordId", recordId.toHex())
        .replace(":hash", hash.toHex());
}

export const INVITED_CONTRIBUTORS_RELATIVE_PATH = LOC_DETAILS_RELATIVE_PATH + "/invited-contributors";
export function invitedContributorsPath(locId: UUID) {
    return USER_PATH + INVITED_CONTRIBUTORS_RELATIVE_PATH
        .replace(":locType", "collection")
        .replace(":locId", locId.toString());
}

