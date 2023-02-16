import { LocType, UUID } from '@logion/node-api';

import {
    LEGAL_OFFICER_PATH,
    locDetailsRelativePath,
    locRequestsRelativePath,
    LOC_REQUESTS_RELATIVE_PATH,
    LOC_DETAILS_RELATIVE_PATH,
} from '../RootPaths';

export const HOME_PATH = LEGAL_OFFICER_PATH;

export const PROTECTION_REQUESTS_RELATIVE_PATH = '/protection';
export const PROTECTION_REQUESTS_PATH = LEGAL_OFFICER_PATH + PROTECTION_REQUESTS_RELATIVE_PATH;

export const RECOVERY_REQUESTS_RELATIVE_PATH = '/recovery';
export const RECOVERY_REQUESTS_PATH = LEGAL_OFFICER_PATH + RECOVERY_REQUESTS_RELATIVE_PATH;

export const RECOVERY_DETAILS_RELATIVE_PATH = '/recovery-details/:requestId';
export const RECOVERY_DETAILS_PATH = LEGAL_OFFICER_PATH + RECOVERY_DETAILS_RELATIVE_PATH;
export function recoveryDetailsPath(requestId: string): string {
    return RECOVERY_DETAILS_PATH.replace(":requestId", requestId);
}

export const SETTINGS_RELATIVE_PATH = '/settings';
export const SETTINGS_PATH = LEGAL_OFFICER_PATH + SETTINGS_RELATIVE_PATH;

export const WALLET_RELATIVE_PATH = '/wallet';
export const WALLET_PATH = LEGAL_OFFICER_PATH + WALLET_RELATIVE_PATH;

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

const LOC_SELECT_VTP_RELATIVE_PATH = LOC_REQUESTS_RELATIVE_PATH + '/:locId/vtp';
export function locSelectVTPPath(locType: LocType) {
    return LOC_SELECT_VTP_RELATIVE_PATH
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
export function documentClaimHistoryPath(locId: UUID, hash: string) {
    return LEGAL_OFFICER_PATH + DOCUMENT_CLAIM_HISTORY_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString())
        .replace(":hash", hash);
}

export const TOKENS_RECORD_RELATIVE_PATH = LOC_DETAILS_RELATIVE_PATH + "/records";
export function tokensRecordPath(locId: UUID) {
    return LEGAL_OFFICER_PATH + TOKENS_RECORD_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString());
}

export const TOKENS_RECORD_VTP_RELATIVE_PATH = TOKENS_RECORD_RELATIVE_PATH + "/vtp";
export function recordsSelectVTPPath(locId: UUID) {
    return LEGAL_OFFICER_PATH + TOKENS_RECORD_VTP_RELATIVE_PATH
        .replace(":locType", "Collection")
        .replace(":locId", locId.toString());
}
