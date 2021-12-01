import { UUID } from "./logion-chain/UUID";

export const PUBLIC_PATH = "/public";
export const CERTIFICATE_RELATIVE_PATH = "/certificate/:locId";
export const CERTIFICATE_PATH = PUBLIC_PATH + CERTIFICATE_RELATIVE_PATH;

export function certificatePath(locId: UUID): string {
    return CERTIFICATE_PATH.replace(":locId", locId.toDecimalString())
}

export function fullCertificateUrl(locId: UUID): string {
    return `${window.location.protocol}//${window.location.host}${certificatePath(locId)}`
}
