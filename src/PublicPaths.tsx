import { UUID, Hash } from "@logion/node-api";

export const PUBLIC_PATH = "/public";
export const CERTIFICATE_RELATIVE_PATH = "/certificate/:locId";
const CERTIFICATE_PATH = PUBLIC_PATH + CERTIFICATE_RELATIVE_PATH;

export const COLLECTION_ITEM_CERTIFICATE_RELATIVE_PATH = ":collectionItemId";
const COLLECTION_ITEM_CERTIFICATE_PATH = CERTIFICATE_PATH + "/" + COLLECTION_ITEM_CERTIFICATE_RELATIVE_PATH;

export const TOKENS_RECORD_CERTIFICATE_RELATIVE_PATH = "record/:tokensRecordId";
const TOKENS_RECORD_CERTIFICATE_PATH = CERTIFICATE_PATH + "/" + TOKENS_RECORD_CERTIFICATE_RELATIVE_PATH;

function certificatePath(locId: UUID, params: { collectionItemId?: Hash, tokensRecordId?: Hash }): string {
    const { collectionItemId, tokensRecordId } = params;
    if (collectionItemId) {
        return COLLECTION_ITEM_CERTIFICATE_PATH
            .replace(":locId", locId.toDecimalString())
            .replace(":collectionItemId", collectionItemId.toHex())
    } else if (tokensRecordId) {
        return TOKENS_RECORD_CERTIFICATE_PATH
            .replace(":locId", locId.toDecimalString())
            .replace(":tokensRecordId", tokensRecordId.toHex())
    } else {
        return CERTIFICATE_PATH.replace(":locId", locId.toDecimalString())
    }
}

function redirectQuery(noRedirect?: boolean, redirected?: boolean): string {
    const queries = [];
    if (noRedirect) {
        queries.push("noredirect=1");
    }
    if (redirected) {
        queries.push("redirected=1");
    }
    return queries.length === 0 ? "" : "?" + queries.join('&');
}

export function fullCertificateUrl(locId: UUID, noRedirect?: boolean, redirected?: boolean): string {
    return `${ getBaseUrl() }${ certificatePath(locId, {}) }${ redirectQuery(noRedirect, redirected) }`;
}

export function fullCollectionItemCertificate(locId: UUID, collectionItemId: Hash, noRedirect?: boolean, redirected?: boolean): string {
    return `${ getBaseUrl() }${ certificatePath(locId, { collectionItemId }) }${ redirectQuery(noRedirect, redirected) }`;
}

export function fullTokensRecordsCertificate(locId: UUID, recordId: Hash, noRedirect?: boolean, redirected?: boolean): string {
    return `${ getBaseUrl() }${ certificatePath(locId, { tokensRecordId: recordId }) }${ redirectQuery(noRedirect, redirected) }`;
}

export function getBaseUrl(): string {
    return `${ window.location.protocol }//${ window.location.host }`;
}

export const SECRET_RECOVERY_RELATIVE_PATH = "/secret-recovery";
export const SECRET_RECOVERY_PATH = PUBLIC_PATH + SECRET_RECOVERY_RELATIVE_PATH;

export const SECRET_DOWNLOAD_RELATIVE_PATH = "/secret-download/:locId/:challenge/:requestId";
export const SECRET_DOWNLOAD_PATH = PUBLIC_PATH + SECRET_DOWNLOAD_RELATIVE_PATH;

export function secretDownloadPageUrl(locId: UUID, challenge: string, requestId: string) {
    return SECRET_DOWNLOAD_PATH
        .replace(":locId", locId.toDecimalString())
        .replace(":challenge", challenge)
        .replace(":requestId", requestId);
}

export function fullSecretDownloadPageUrl(locId: UUID, challenge: string, requestId: string) {
    return `${ getBaseUrl() }${ secretDownloadPageUrl(locId, challenge, requestId) }`;
}
