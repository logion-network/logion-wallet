import { LEGAL_OFFICER_PATH } from '../RootPaths';

export const HOME_PATH = LEGAL_OFFICER_PATH;
export const TOKENIZATION_REQUESTS_PATH = LEGAL_OFFICER_PATH + '/tokenization';
export const PROTECTION_REQUESTS_PATH = LEGAL_OFFICER_PATH + '/protection';
export const RECOVERY_REQUESTS_PATH = LEGAL_OFFICER_PATH + '/recovery';
export const RECOVERY_DETAILS_PATH = LEGAL_OFFICER_PATH + '/recovery-details/:requestId';
export const SETTINGS_PATH = LEGAL_OFFICER_PATH + '/settings';
export const NFT_PATH = LEGAL_OFFICER_PATH + '/nft';

export function recoveryDetailsPath(requestId: string): string {
    return RECOVERY_DETAILS_PATH.replace(":requestId", requestId);
}

export const WALLET_PATH = LEGAL_OFFICER_PATH + '/wallet';

export const TRANSACTIONS_PATH = LEGAL_OFFICER_PATH + '/transactions/:coinId';
export function transactionsPath(coinId: string): string {
    return TRANSACTIONS_PATH.replace(":coinId", coinId);
}