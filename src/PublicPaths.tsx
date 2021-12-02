import { UUID } from "./logion-chain/UUID";

export const PUBLIC_PATH = "/public";
export const CERTIFICATE_RELATIVE_PATH = "/certificate/:locId";
export const CERTIFICATE_PATH = PUBLIC_PATH + CERTIFICATE_RELATIVE_PATH;

export function certificatePath(locId: UUID): string {
    return CERTIFICATE_PATH.replace(":locId", locId.toDecimalString())
}

export function fullCertificateUrl(locId: UUID, noRedirect?: boolean, redirected?: boolean): string {
    const queries = [];
    if(noRedirect) {
        queries.push("noredirect=1");
    }
    if(redirected) {
        queries.push("redirected=1");
    }
    const query = queries.length === 0 ? "" : "?" + queries.join('&');
    return `${window.location.protocol}//${window.location.host}${certificatePath(locId)}${query}`;
}
