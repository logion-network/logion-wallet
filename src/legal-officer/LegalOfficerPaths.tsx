import { LocType, UUID, Hash } from '@logion/node-api';

import {
    LEGAL_OFFICER_PATH,
    locDetailsRelativePath,
    locRequestsRelativePath,
    LOC_REQUESTS_RELATIVE_PATH,
    LOC_DETAILS_RELATIVE_PATH,
} from '../RootPaths';
import { RecoveryRequestType } from './Model';

export const HOME_PATH = LEGAL_OFFICER_PATH;

export const RECOVERY_REQUESTS_RELATIVE_PATH = '/recovery';
export const RECOVERY_REQUESTS_PATH = LEGAL_OFFICER_PATH + RECOVERY_REQUESTS_RELATIVE_PATH;

export const RECOVERY_DETAILS_RELATIVE_PATH = RECOVERY_REQUESTS_RELATIVE_PATH + '/:requestId/:type';
export const RECOVERY_DETAILS_PATH = LEGAL_OFFICER_PATH + RECOVERY_DETAILS_RELATIVE_PATH;
export function recoveryDetailsPath(requestId: string, type: RecoveryRequestType): string {
    return RECOVERY_DETAILS_PATH
        .replace(":requestId", requestId)
        .replace(":type", type);
}

export const SETTINGS_RELATIVE_PATH = '/settings';
export const SETTINGS_PATH = LEGAL_OFFICER_PATH + SETTINGS_RELATIVE_PATH;

export const WALLET_RELATIVE_PATH = '/wallet';

export const TRANSACTIONS_RELATIVE_PATH = WALLET_RELATIVE_PATH + '/transactions/:coinId';
export const TRANSACTIONS_PATH = LEGAL_OFFICER_PATH + TRANSACTIONS_RELATIVE_PATH;
export function transactionsPath(coinId: string): string {
    return TRANSACTIONS_PATH.replace(":coinId", coinId);
}

export function locRequestsPath(locType: LocType) {
    return LEGAL_OFFICER_PATH + locRequestsRelativePath(locType)
}

export function dataLocDetailsPath(locType: LocType, locId: string) {
    return LEGAL_OFFICER_PATH + locDetailsRelativePath(locType)
        .replace(":locId", locId)
}

export function identityLocDetailsPath(locId: string) {
    return locDetailsPath(locId, 'Identity');
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

export const VAULT_OUT_REQUESTS_RELATIVE_PATH = '/vault';
export const VAULT_OUT_REQUESTS_PATH = LEGAL_OFFICER_PATH + VAULT_OUT_REQUESTS_RELATIVE_PATH;

export const STATEMENT_OF_FACTS_RELATIVE_PATH = '/statement';
export const STATEMENT_OF_FACTS_PATH = LEGAL_OFFICER_PATH + STATEMENT_OF_FACTS_RELATIVE_PATH;

const LOC_SELECT_ISSUER_RELATIVE_PATH = LOC_REQUESTS_RELATIVE_PATH + '/:locId/verified-issuer';
export function locSelectIssuerPath(locType: LocType) {
    return LOC_SELECT_ISSUER_RELATIVE_PATH
        .replace(":locType", locType.toLowerCase())
}

export const VOTES_RELATIVE_PATH = '/votes';
export const VOTES_PATH = LEGAL_OFFICER_PATH + VOTES_RELATIVE_PATH;

export const VOTE_LOC_RELATIVE_PATH = VOTES_RELATIVE_PATH + '/loc/:locId';
export function voteLocRelativePath(locId: UUID) {
    return VOTE_LOC_RELATIVE_PATH
        .replace(":locId", locId.toString());
}

export function voteLocPath(locId: UUID) {
    return LEGAL_OFFICER_PATH + voteLocRelativePath(locId);
}

export const DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH = LOC_DETAILS_RELATIVE_PATH + "/claims/:hash";
export function documentClaimHistoryPath(locId: UUID, hash: Hash) {
    return LEGAL_OFFICER_PATH + DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString())
        .replace(":hash", hash.toHex());
}

export const TOKENS_RECORD_RELATIVE_PATH = LOC_DETAILS_RELATIVE_PATH + "/records";
export function tokensRecordPath(locId: UUID) {
    return LEGAL_OFFICER_PATH + TOKENS_RECORD_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString());
}

export const TOKENS_RECORD_ISSUER_RELATIVE_PATH = TOKENS_RECORD_RELATIVE_PATH + "/verified-issuer";
export function recordsSelectIssuerPath(locId: UUID) {
    return LEGAL_OFFICER_PATH + TOKENS_RECORD_ISSUER_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString());
}

export const TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH = LOC_DETAILS_RELATIVE_PATH + "/records/:recordId/claims/:hash";
export function tokensRecordDocumentClaimHistoryPath(locId: UUID, recordId: Hash, hash: Hash) {
    return LEGAL_OFFICER_PATH + TOKENS_RECORD_DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString())
        .replace(":recordId", recordId.toHex())
        .replace(":hash", hash.toHex());
}

export const INVITED_CONTRIBUTORS_RELATIVE_PATH = LOC_DETAILS_RELATIVE_PATH + "/invited-contributors";
export function invitedContributorsPath(locId: UUID) {
    return LEGAL_OFFICER_PATH + INVITED_CONTRIBUTORS_RELATIVE_PATH
        .replace(":locType", "collection")
        .replace(":locId", locId.toString());
}
