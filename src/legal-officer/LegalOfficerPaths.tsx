import { LEGAL_OFFICER_PATH } from '../RootPaths';

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

export const LOC_REQUESTS_RELATIVE_PATH = '/loc';
export const LOC_REQUESTS_PATH = LEGAL_OFFICER_PATH + LOC_REQUESTS_RELATIVE_PATH;

export const TRANSACTION_LOC_DETAILS_RELATIVE_PATH = LOC_REQUESTS_RELATIVE_PATH + '/:locId';
export const TRANSACTION_LOC_DETAILS_PATH = LEGAL_OFFICER_PATH + TRANSACTION_LOC_DETAILS_RELATIVE_PATH;
export function transactionLocDetailsPath(locId: string) {
    return TRANSACTION_LOC_DETAILS_PATH.replace(":locId", locId)
}

export const IDENTITIES_RELATIVE_PATH = '/identities';
export const IDENTITIES_PATH = LEGAL_OFFICER_PATH + IDENTITIES_RELATIVE_PATH;

export const IDENTITY_LOC_DETAILS_RELATIVE_PATH = IDENTITIES_RELATIVE_PATH + '/:locId';
export const IDENTITY_LOC_TRANSACTION_DETAILS_PATH = LEGAL_OFFICER_PATH + IDENTITY_LOC_DETAILS_RELATIVE_PATH;
export function identityLocDetailsPath(locId: string) {
    return IDENTITY_LOC_TRANSACTION_DETAILS_PATH.replace(":locId", locId)
}
