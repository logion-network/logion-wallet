import { UUID, Hash } from "@logion/node-api";

export const PUBLIC_PATH = "/public";
export const CERTIFICATE_RELATIVE_PATH = "/certificate/:locId";
export const CERTIFICATE_PATH = PUBLIC_PATH + CERTIFICATE_RELATIVE_PATH;

const COLLECTION_ITEM_CERTIFICATE_PATH = CERTIFICATE_PATH + "/:collectionItemId";

function certificatePath(locId: UUID, collectionItemId?: Hash): string {
    if (collectionItemId) {
        return COLLECTION_ITEM_CERTIFICATE_PATH
            .replace(":locId", locId.toDecimalString())
            .replace(":collectionItemId", collectionItemId.toHex())
    } else {
        return CERTIFICATE_PATH.replace(":locId", locId.toDecimalString())
    }
}

export function fullCertificateUrl(locId: UUID, noRedirect?: boolean, redirected?: boolean): string {
    return fullCollectionItemCertificate(locId, undefined, noRedirect, redirected)
}

export function fullCollectionItemCertificate(locId: UUID, collectionItemId?: Hash, noRedirect?: boolean, redirected?: boolean): string {
    const queries = [];
    if (noRedirect) {
        queries.push("noredirect=1");
    }
    if (redirected) {
        queries.push("redirected=1");
    }
    const query = queries.length === 0 ? "" : "?" + queries.join('&');
    return `${ getBaseUrl() }${ certificatePath(locId, collectionItemId) }${ query }`;
}

export function getBaseUrl(): string {
    return `${ window.location.protocol }//${ window.location.host }`;
}
