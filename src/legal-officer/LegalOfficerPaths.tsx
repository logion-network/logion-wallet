import { LEGAL_OFFICER_PATH } from '../RootPaths';

export const TOKENIZATION_REQUESTS_PATH = LEGAL_OFFICER_PATH + '/tokenization';
export const PROTECTION_REQUESTS_PATH = LEGAL_OFFICER_PATH + '/protection';
export const RECOVERY_REQUESTS_PATH = LEGAL_OFFICER_PATH + '/recovery';
export const RECOVERY_DETAILS_PATH = LEGAL_OFFICER_PATH + '/recovery-details/:requestId';
export const SETTINGS_PATH = LEGAL_OFFICER_PATH + '/settings';

export function recoveryDetailsPath(requestId: string): string {
    return RECOVERY_DETAILS_PATH.replace(":requestId", requestId);
}
